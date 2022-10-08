use crate::{ configuration::SchemaRegistry, schema_registry::SchemaRegistryClient };
use super::error::{ Result, TauriError };
use crate::schema_registry::{ self, CachedSchemaRegistry, Schema };

#[tauri::command]
pub async fn list_subjects(config: SchemaRegistry) -> Result<Vec<String>> {
    let SchemaRegistry { username, endpoint, password } = config;
    let client = CachedSchemaRegistry::new(endpoint, &username, &password);
    let res = client.list_subjects().await?;
    Ok(res)
}

#[tauri::command]
pub async fn get_schema(subject_name: String, config: SchemaRegistry) -> Result<Vec<Schema>> {
    let SchemaRegistry { username, endpoint, password } = config;
    let client = CachedSchemaRegistry::new(endpoint, &username, &password);
    let res = client.get_schema(subject_name).await?;
    Ok(res)
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