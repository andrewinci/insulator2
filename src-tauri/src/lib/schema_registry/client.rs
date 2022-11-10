use async_trait::async_trait;
use futures::lock::Mutex;
use log::{debug, trace};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::Arc;
use url::Url;

use apache_avro::Schema as AvroSchema;

use crate::lib::Error;

use super::error::{Result, SchemaRegistryError};
use super::http_client::{HttpClient, ReqwestClient};
use super::types::{BasicAuth, Schema, Subject};

#[derive(Deserialize)]
struct GetSchemaByIdResult {
    pub schema: String,
}

#[async_trait]
pub trait SchemaRegistryClient {
    async fn list_subjects(&self) -> Result<Vec<String>>;
    async fn get_subject(&self, subject_name: &str) -> Result<Subject>;
    async fn get_schema_by_id(&self, id: i32) -> Result<AvroSchema>;
    async fn delete_subject(&self, subject_name: &str) -> Result<()>;
    async fn delete_version(&self, subject_name: &str, version: i32) -> Result<()>;
    async fn post_schema(&self, subject_name: &str, schema: &'static str) -> Result<()>;
}

#[derive(Clone)]
pub struct CachedSchemaRegistry<C = ReqwestClient>
where
    C: HttpClient + Sync + Send,
{
    http_client: C,
    endpoint: String,
    schema_cache_by_id: Arc<Mutex<HashMap<i32, AvroSchema>>>,
}

impl CachedSchemaRegistry<ReqwestClient> {
    pub fn new(endpoint: &str, username: Option<&str>, password: Option<&str>) -> Self {
        assert!(!endpoint.is_empty());
        let auth = if let Some(username) = username {
            assert!(!username.is_empty());
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
        }
    }
}

#[async_trait]
impl<C> SchemaRegistryClient for CachedSchemaRegistry<C>
where
    C: HttpClient + Sync + Send,
{
    async fn post_schema(&self, subject_name: &str, schema: &'static str) -> Result<()> {
        let url = Url::parse(&self.endpoint)?
            .join("subjects")?
            .join(subject_name)?
            .join("versions")?;
        match AvroSchema::parse_str(schema) {
            Ok(_) => Ok(self.http_client.post(url.as_str(), &schema).await?),
            Err(err) => Err(SchemaRegistryError::SchemaParsing {
                message: format!("Invalid schema {}", err),
            }),
        }
    }

    async fn list_subjects(&self) -> Result<Vec<String>> {
        let url = Url::parse(&self.endpoint)?.join("subjects")?;
        let res = self.http_client.get(url.as_ref()).await?;
        Ok(res)
    }

    async fn get_subject(&self, subject_name: &str) -> Result<Subject> {
        debug!("Get subject {}", subject_name);
        Ok(Subject {
            subject: subject_name.into(),
            versions: self.get_versions(subject_name).await?,
            compatibility: self.get_compatibility_level(subject_name).await?,
        })
    }

    async fn delete_subject(&self, subject_name: &str) -> Result<()> {
        debug!("Deleting subject {}", subject_name);
        let url = Url::parse(&self.endpoint)?.join(format!("/subjects/{}", subject_name).as_str())?;
        Ok(self.http_client.delete(url.as_str()).await?)
    }

    async fn delete_version(&self, subject_name: &str, version: i32) -> Result<()> {
        debug!("Deleting subject {} version {}", subject_name, version);
        let url =
            Url::parse(&self.endpoint)?.join(format!("/subjects/{}/versions/{}", subject_name, version).as_str())?;
        Ok(self.http_client.delete(url.as_str()).await?)
    }

    async fn get_schema_by_id(&self, id: i32) -> Result<AvroSchema> {
        let mut cache = self.schema_cache_by_id.lock().await;
        trace!("Getting schema {} by id.", id);
        if let Some(cached) = cache.get(&id) {
            trace!("Schema found in cache");
            Ok(cached.clone())
        } else {
            trace!("Schema not found in cache, retrieving");
            let url = Url::parse(&self.endpoint)?.join(format!("/schemas/ids/{}", id).as_str())?;
            let schema: GetSchemaByIdResult = self.http_client.get(url.as_str()).await?;
            let schema =
                AvroSchema::parse_str(schema.schema.as_str()).map_err(|err| SchemaRegistryError::SchemaParsing {
                    message: format!("{}\n{}", "Unable to parse the schema from schema registry", err),
                })?;
            cache.insert(id, schema.clone());
            Ok(schema)
        }
    }
}

impl<C> CachedSchemaRegistry<C>
where
    C: HttpClient + Sync + Send,
{
    async fn get_compatibility_level(&self, subject_name: &str) -> Result<String> {
        #[derive(Deserialize)]
        struct CompatibilityResponse {
            #[serde(alias = "compatibilityLevel")]
            compatibility_level: String,
        }
        let url = Url::parse(&self.endpoint)?.join(format!("/config/{}?defaultToGlobal=true", subject_name).as_str())?;
        let response: CompatibilityResponse = self.http_client.get(url.as_ref()).await?;
        Ok(response.compatibility_level)
    }

    async fn get_versions(&self, subject_name: &str) -> Result<Vec<Schema>> {
        let url = Url::parse(&self.endpoint)?.join(format!("/subjects/{}/versions/", subject_name).as_str())?;
        let versions: Vec<i32> = self.http_client.get(url.as_ref()).await?;
        let mut schemas = Vec::<Schema>::new();
        for v in versions {
            let url = url.join(&v.to_string())?;
            let schema: Schema = self.http_client.get(url.as_ref()).await?;
            schemas.push(schema);
        }
        Ok(schemas)
    }
}
