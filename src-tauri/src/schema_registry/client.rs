use std::sync::Arc;

use futures::future::BoxFuture;
use futures::FutureExt;
use url::Url;

use super::types::{ BasicAuth, GetSchemaByIdResult, Schema };
use super::{ error::Result, http_client::HttpClient };

pub trait SchemaRegistryClient {
    fn list_subjects(&self) -> BoxFuture<Result<Vec<String>>>;
    fn get_schema(&self, subject_name: String) -> BoxFuture<Result<Vec<Schema>>>;
    fn get_schema_by_id(&self, id: i32) -> BoxFuture<Result<String>>;
}

pub struct CachedSchemaRegistry<T: HttpClient> {
    http_client: Arc<T>,
    endpoint: String,
    auth: Option<BasicAuth>,
}

impl<T: HttpClient> CachedSchemaRegistry<T> {
    pub fn new(endpoint: String, auth: Option<BasicAuth>, http_client: T) -> CachedSchemaRegistry<T> {
        CachedSchemaRegistry {
            endpoint,
            auth,
            http_client: Arc::new(http_client),
        }
    }
}

impl<T: HttpClient + std::marker::Sync + std::marker::Send> SchemaRegistryClient for CachedSchemaRegistry<T> {
    fn list_subjects(&self) -> BoxFuture<Result<Vec<String>>> {
        (
            async move {
                let url = Url::parse(&self.endpoint)?.join("subjects")?;
                let res = self.http_client.get(url.to_string(), self.auth.clone()).await?;
                Ok(res)
            }
        ).boxed()
    }

    fn get_schema(&self, subject_name: String) -> BoxFuture<Result<Vec<Schema>>> {
        (
            async move {
                let auth = self.auth.clone();
                let url = Url::parse(&self.endpoint)?.join(format!("/subjects/{}/versions/", subject_name).as_str())?;
                let versions: Vec<i32> = self.http_client.get(url.to_string(), auth.clone()).await?;
                let mut schemas = Vec::<Schema>::new();
                for v in versions {
                    let url = url.join(&v.to_string())?;
                    let schema: Schema = self.http_client.get(url.to_string(), auth.clone()).await?;
                    schemas.push(schema);
                }
                Ok(schemas)
            }
        ).boxed()
    }

    fn get_schema_by_id(&self, id: i32) -> BoxFuture<Result<String>> {
        (
            async move {
                let url = Url::parse(&self.endpoint)?.join(format!("/schemas/ids/{}", id).as_str())?;
                let schema: GetSchemaByIdResult = self.http_client.get(url.to_string(), self.auth.clone()).await?;
                Ok(schema.schema)
            }
        ).boxed()
    }
}