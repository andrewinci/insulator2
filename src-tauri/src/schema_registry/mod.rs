use serde::{ de::DeserializeOwned };

use crate::{ configuration::model::SchemaRegistry, error::Result };

async fn get<T: DeserializeOwned>(url: String, config: SchemaRegistry) -> Result<T> {
    let client = reqwest::Client::new();
    let mut request = client.get(url);
    if let Some(username) = config.username {
        request = request.basic_auth(username, config.password);
    }
    let res = request.send().await?.json().await?;
    Ok(res)
}

#[tauri::command]
pub async fn list_subjects(config: SchemaRegistry) -> Result<Vec<String>> {
    let res = get(format!("{:}/subjects", config.endpoint), config).await?;
    Ok(res)
}