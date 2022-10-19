use async_trait::async_trait;
use futures::lock::Mutex;
use log::trace;
use std::collections::HashMap;
use std::sync::Arc;
use url::Url;

use super::error::Result;
use super::http_client::{HttpClient, ReqwestClient};
use super::types::{BasicAuth, GetSchemaByIdResult, Schema};

#[async_trait]
pub trait SchemaRegistryClient {
    async fn list_subjects(&self) -> Result<Vec<String>>;
    async fn get_schema(&self, subject_name: &str) -> Result<Vec<Schema>>;
    async fn get_schema_by_id(&self, id: i32) -> Result<String>;
}

#[derive(Clone)]
pub struct CachedSchemaRegistry<C = ReqwestClient>
where
    C: HttpClient + Sync + Send,
{
    http_client: C,
    endpoint: String,
    schema_cache_by_id: Arc<Mutex<HashMap<i32, String>>>,
    schema_cache_by_subject: Arc<Mutex<HashMap<String, Vec<Schema>>>>,
}

impl CachedSchemaRegistry<ReqwestClient> {
    pub fn new(endpoint: &str, username: Option<&str>, password: Option<&str>) -> Self {
        let auth = if let Some(username) = username {
            let auth = BasicAuth {
                username: username.to_string(),
                password: password.map(|p| p.to_owned()),
            };
            Some(auth)
        } else {
            None
        };
        let http_client = ReqwestClient::new(auth);
        CachedSchemaRegistry::new_with_client(endpoint, http_client)
    }
}

impl<C> CachedSchemaRegistry<C>
where
    C: HttpClient + Sync + Send,
{
    pub fn new_with_client(endpoint: &str, http_client: C) -> Self {
        Self {
            http_client,
            endpoint: endpoint.into(),
            schema_cache_by_id: Arc::new(Mutex::new(HashMap::new())),
            schema_cache_by_subject: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl<C> SchemaRegistryClient for CachedSchemaRegistry<C>
where
    C: HttpClient + Sync + Send,
{
    async fn list_subjects(&self) -> Result<Vec<String>> {
        let url = Url::parse(&self.endpoint)?.join("subjects")?;
        let res = self.http_client.get(url.as_ref()).await?;
        Ok(res)
    }

    async fn get_schema(&self, subject_name: &str) -> Result<Vec<Schema>> {
        let mut cache = self.schema_cache_by_subject.lock().await;
        trace!("Get schema for {}", subject_name);
        if let Some(cached) = cache.get(subject_name) {
            trace!("Schema found in cache");
            Ok(cached.clone())
        } else {
            trace!("Schema not found in cache, retrieving");
            let url = Url::parse(&self.endpoint)?.join(format!("/subjects/{}/versions/", subject_name).as_str())?;
            let versions: Vec<i32> = self.http_client.get(url.as_ref()).await?;
            let mut schemas = Vec::<Schema>::new();
            for v in versions {
                let url = url.join(&v.to_string())?;
                let schema: Schema = self.http_client.get(url.as_ref()).await?;
                schemas.push(schema);
            }
            cache.insert(subject_name.to_string(), schemas.clone());
            Ok(schemas)
        }
    }

    async fn get_schema_by_id(&self, id: i32) -> Result<String> {
        let mut cache = self.schema_cache_by_id.lock().await;
        trace!("Getting schema {} by id.", id);

        if let Some(cached) = cache.get(&id) {
            trace!("Schema found in cache");
            Ok(cached.clone())
        } else {
            trace!("Schema not found in cache, retrieving");
            let url = Url::parse(&self.endpoint)?.join(format!("/schemas/ids/{}", id).as_str())?;
            let schema: GetSchemaByIdResult = self.http_client.get(url.as_ref()).await?;
            cache.insert(id, schema.schema.clone());
            Ok(schema.schema)
        }
    }
}

#[cfg(test)]
mod tests {
    use async_trait::async_trait;
    use mockall::mock;
    use serde::de::DeserializeOwned;

    use super::{CachedSchemaRegistry, Result, SchemaRegistryClient};
    use crate::lib::schema_registry::{http_client::HttpClient, types::GetSchemaByIdResult};
    use mockall::predicate::*;

    #[tokio::test]
    async fn test_cache() {
        mock! {
            HttpTestClient {}

            #[async_trait]
            impl HttpClient for HttpTestClient {
                async fn get<T: 'static + DeserializeOwned>(&self, _url: &str) -> Result<T>;
            }
        }
        let mut mock_http_client = MockHttpTestClient::new();
        mock_http_client
            .expect_get::<GetSchemaByIdResult>()
            .once()
            .returning(|_| Ok(GetSchemaByIdResult { schema: "123".into() }));

        let sut = CachedSchemaRegistry::new_with_client("https://example.com", mock_http_client);
        let call_1 = sut.get_schema_by_id(1).await;
        let call_2 = sut.get_schema_by_id(1).await;
        assert!(call_1.is_ok());
        assert!(call_2.is_ok());
    }
}
