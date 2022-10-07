use crate::configuration::SchemaRegistry as SchemaRegistryConfiguration;
use super::error::{ Result, TauriError };
use crate::schema_registry::{ self, BasicAuth, CachedSchemaRegistry, ReqwestClient, Schema, SchemaRegistryClient };

#[tauri::command]
pub async fn list_subjects(config: SchemaRegistryConfiguration) -> Result<Vec<String>> {
    let client = build_schema_registry_client(config);
    let res = client.list_subjects().await?;
    Ok(res)
}

#[tauri::command]
pub async fn get_schema(subject_name: String, config: SchemaRegistryConfiguration) -> Result<Vec<Schema>> {
    let client = build_schema_registry_client(config);
    let res = client.get_schema(subject_name).await?;
    Ok(res)
}

fn build_schema_registry_client(config: SchemaRegistryConfiguration) -> CachedSchemaRegistry<ReqwestClient> {
    let http_client = ReqwestClient::new(Some(5));
    let endpoint = config.endpoint.clone();
    let auth = if let Some(username) = config.username {
        Some(BasicAuth {
            username,
            password: config.password,
        })
    } else {
        None
    };
    CachedSchemaRegistry::new(endpoint, auth, http_client)
}

impl From<schema_registry::SchemaRegistryError> for TauriError {
    fn from(err: schema_registry::SchemaRegistryError) -> Self {
        TauriError {
            error_type: "Schema registry error".into(),
            message: match err {
                schema_registry::SchemaRegistryError::HttpClientError { msg } => msg,
                schema_registry::SchemaRegistryError::UrlError => "Invalid url".into(),
            },
        }
    }
}