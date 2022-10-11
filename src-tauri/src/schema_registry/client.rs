use futures::future::BoxFuture;
use futures::lock::Mutex;
use futures::FutureExt;
use log::{ debug, trace };
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use std::sync::Arc;
use url::Url;

use super::types::{ BasicAuth, GetSchemaByIdResult, Schema };
use super::{ error::Result };

pub trait SchemaRegistryClient {
    fn list_subjects(&self) -> BoxFuture<Result<Vec<String>>>;
    fn get_schema(&self, subject_name: String) -> BoxFuture<Result<Vec<Schema>>>;
    fn get_schema_by_id(&self, id: i32) -> BoxFuture<Result<String>>;
}

pub struct CachedSchemaRegistry {
    client: reqwest::Client,
    endpoint: String,
    auth: Option<BasicAuth>,
    timeout_seconds: u64,
    schema_cache: Arc<Mutex<HashMap<i32, String>>>,
}

impl CachedSchemaRegistry {
    pub fn new(endpoint: String, username: &Option<String>, password: &Option<String>) -> CachedSchemaRegistry {
        let auth = username.clone().map(|username| BasicAuth {
            username,
            password: password.clone(),
        });
        CachedSchemaRegistry::new_with_client(endpoint, auth, reqwest::Client::new())
    }

    pub fn new_with_client(endpoint: String, auth: Option<BasicAuth>, client: reqwest::Client) -> CachedSchemaRegistry {
        CachedSchemaRegistry {
            endpoint,
            auth,
            timeout_seconds: 10,
            client,
            schema_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl SchemaRegistryClient for CachedSchemaRegistry {
    fn list_subjects(&self) -> BoxFuture<Result<Vec<String>>> {
        (
            async move {
                let url = Url::parse(&self.endpoint)?.join("subjects")?;
                let res = self.get(url.as_ref(), &self.auth).await?;
                Ok(res)
            }
        ).boxed()
    }

    fn get_schema(&self, subject_name: String) -> BoxFuture<Result<Vec<Schema>>> {
        (
            async move {
                trace!("Getting schema {} by subject name.", subject_name);
                let url = Url::parse(&self.endpoint)?.join(format!("/subjects/{}/versions/", subject_name).as_str())?;
                let versions: Vec<i32> = self.get(url.as_ref(), &self.auth).await?;
                let mut schemas = Vec::<Schema>::new();
                for v in versions {
                    let url = url.join(&v.to_string())?;
                    let schema: Schema = self.get(url.as_ref(), &self.auth).await?;
                    schemas.push(schema);
                }
                Ok(schemas)
            }
        ).boxed()
    }

    fn get_schema_by_id(&self, id: i32) -> BoxFuture<Result<String>> {
        (
            async move {
                let mut cache = self.schema_cache.lock().await;
                trace!("Getting schema {} by id.", id);

                if let Some(cached) = cache.get(&id) {
                    trace!("Schema found in cache");
                    Ok(cached.clone())
                } else {
                    trace!("Schema not found in cache, retrieving");
                    let url = Url::parse(&self.endpoint)?.join(format!("/schemas/ids/{}", id).as_str())?;
                    let schema: GetSchemaByIdResult = self.get(url.as_ref(), &self.auth).await?;
                    trace!("Updating cache");
                    cache.insert(id, schema.schema.clone());
                    Ok(schema.schema)
                }
            }
        ).boxed()
    }
}

impl CachedSchemaRegistry {
    fn get<T: DeserializeOwned>(&self, url: &str, auth: &Option<BasicAuth>) -> BoxFuture<Result<T>> {
        let url = url.to_string();
        let auth = auth.clone();
        (
            async move {
                let mut request = self.client.get(url);
                request = request.timeout(core::time::Duration::from_secs(self.timeout_seconds));
                if let Some(auth) = auth {
                    request = request.basic_auth(auth.username, auth.password);
                }
                let response = request.send().await?;
                let res = response.json().await?;
                Ok(res)
            }
        ).boxed()
    }
}

#[cfg(test)]
mod tests {
    use httpmock::{ MockServer, Method::GET };

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
        let sut = CachedSchemaRegistry::new(server.base_url(), &None, &None);
        let call_1 = sut.get_schema_by_id(1).await;
        let call_2 = sut.get_schema_by_id(1).await;
        assert!(call_1.is_ok());
        assert!(call_2.is_ok());
        // Ensure the specified mock was called exactly one time (or fail with a detailed error description).
        server_mock.assert();
    }
}