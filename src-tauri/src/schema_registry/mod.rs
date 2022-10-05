use serde::{ de::DeserializeOwned, Deserialize, Serialize };
use std::time::Duration;
use url::Url;

use crate::{ configuration::SchemaRegistry, error::Result };

async fn get<T: DeserializeOwned>(url: String, config: &SchemaRegistry) -> Result<T> {
    let client = reqwest::Client::new();
    let mut request = client.get(url);
    request = request.timeout(Duration::from_secs(5)); //todo: make it configurable
    if let Some(username) = &config.username {
        request = request.basic_auth(username, config.password.as_ref());
    }
    let response = request.send().await?;
    let res = response.json().await?;
    Ok(res)
}

#[tauri::command]
pub async fn list_subjects(config: SchemaRegistry) -> Result<Vec<String>> {
    let url = Url::parse(&config.endpoint)?.join("subjects")?;
    let res = get(url.to_string(), &config).await?;
    Ok(res)
}

#[tauri::command]
pub async fn get_schema(subject_name: String, config: SchemaRegistry) -> Result<Vec<Schema>> {
    let url = Url::parse(&config.endpoint)?.join(format!("/subjects/{}/versions/", subject_name).as_str())?;
    let versions: Vec<i32> = get(url.to_string(), &config).await?;
    let mut schemas = Vec::<Schema>::new();
    for v in versions {
        let schema_url = url.join(&v.to_string())?;
        let schema: Schema = get(schema_url.to_string(), &config).await?;
        schemas.push(schema);
    }
    Ok(schemas)
}

pub async fn get_schema_by_id(id: i32, config: &SchemaRegistry) -> Result<String> {
    let url = Url::parse(&config.endpoint)?.join(format!("/schemas/ids/{}", id).as_str())?;
    let schema: GetSchemaByIdResult = get(url.to_string(), config).await?;
    Ok(schema.schema)
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Schema {
    pub subject: String,
    pub id: i32,
    pub version: i32,
    pub schema: String,
}

#[derive(Deserialize, Serialize)]
pub struct GetSchemaByIdResult {
    pub schema: String,
}