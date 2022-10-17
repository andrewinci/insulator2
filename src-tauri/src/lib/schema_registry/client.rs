use async_trait::async_trait;
use futures::lock::Mutex;
use log::trace;
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use std::sync::Arc;
use url::Url;

use super::error::Result;
use super::types::{ BasicAuth, GetSchemaByIdResult, Schema };

#[async_trait]
pub trait SchemaRegistryClient {
    async fn list_subjects(&self) -> Result<Vec<String>>;
    async fn get_schema(&self, subject_name: &str) -> Result<Vec<Schema>>;
    async fn get_schema_by_id(&self, id: i32) -> Result<String>;
}

pub struct CachedSchemaRegistry {
    client: reqwest::Client,
    endpoint: String,
    auth: Option<BasicAuth>,
    timeout_seconds: u64,
    schema_cache_by_id: Arc<Mutex<HashMap<i32, String>>>,
    schema_cache_by_subject: Arc<Mutex<HashMap<String, Vec<Schema>>>>,
}

impl CachedSchemaRegistry {
    pub fn new(endpoint: &str, username: Option<&str>, password: Option<&str>) -> CachedSchemaRegistry {
        if let Some(username) = username {
            let auth = BasicAuth {
                username: username.to_string(),
                password: password.map(|p| p.to_owned()),
            };
            CachedSchemaRegistry::new_with_client(endpoint, Some(&auth), reqwest::Client::new())
        } else {
            CachedSchemaRegistry::new_with_client(endpoint, None, reqwest::Client::new())
        }
    }

    pub fn new_with_client(endpoint: &str, auth: Option<&BasicAuth>, client: reqwest::Client) -> CachedSchemaRegistry {
        CachedSchemaRegistry {
            endpoint: endpoint.into(),
            auth: auth.map(|a| a.to_owned()),
            timeout_seconds: 10,
            client,
            schema_cache_by_id: Arc::new(Mutex::new(HashMap::new())),
            schema_cache_by_subject: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[async_trait]
impl SchemaRegistryClient for CachedSchemaRegistry {
    async fn list_subjects(&self) -> Result<Vec<String>> {
        let url = Url::parse(&self.endpoint)?.join("subjects")?;
        let res = self.get(url.as_ref(), &self.auth).await?;
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
            let versions: Vec<i32> = self.get(url.as_ref(), &self.auth).await?;
            let mut schemas = Vec::<Schema>::new();
            for v in versions {
                let url = url.join(&v.to_string())?;
                let schema: Schema = self.get(url.as_ref(), &self.auth).await?;
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
            let schema: GetSchemaByIdResult = self.get(url.as_ref(), &self.auth).await?;
            cache.insert(id, schema.schema.clone());
            Ok(schema.schema)
        }
    }
}

impl CachedSchemaRegistry {
    async fn get<T: DeserializeOwned>(&self, url: &str, auth: &Option<BasicAuth>) -> Result<T> {
        let url = url.to_string();
        let auth = auth.clone();

        let mut request = self.client.get(url);
        request = request.timeout(core::time::Duration::from_secs(self.timeout_seconds));
        if let Some(auth) = auth {
            request = request.basic_auth(auth.username, auth.password);
        }
        let response = request.send().await?;
        let res = response.json().await?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use httpmock::{ Method::GET, MockServer };

    use super::{ CachedSchemaRegistry, SchemaRegistryClient };

    #[tokio::test]
    async fn test_cache() {
        // Start a lightweight mock server.
        let server = MockServer::start();

        // Create a mock on the server.
        let server_mock = server.mock(|when, then| {
            when.method(GET).path("/schemas/ids/1");
            then.status(200).header("content-type", "text/json").body("{\"schema\":\"schema-placeholder\"}");
        });
        let sut = CachedSchemaRegistry::new(&server.base_url(), None, None);
        let call_1 = sut.get_schema_by_id(1).await;
        let call_2 = sut.get_schema_by_id(1).await;
        assert!(call_1.is_ok());
        assert!(call_2.is_ok());
        // Ensure the specified mock was called exactly one time (or fail with a detailed error description).
        server_mock.assert();
    }
}