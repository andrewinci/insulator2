use url::Url;
use std::time::Duration;
use serde::{ de::DeserializeOwned, Deserialize, Serialize };

use crate::{ configuration::SchemaRegistry, error::{ Result } };

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
    let url = Url::parse(&config.endpoint)?.join(
        format!("/subjects/{}/versions/", subject_name).as_str()
    )?;
    let versions: Vec<i32> = get(url.to_string(), &config).await?;
    let mut schemas = Vec::<Schema>::new();
    for v in versions {
        let schema_url = url.join(&v.to_string())?;
        let schema: Schema = get(schema_url.to_string(), &config).await?;
        schemas.push(schema);
    }
    Ok(schemas)
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Schema {
    subject: String,
    id: i32,
    version: i32,
    schema: String,
}