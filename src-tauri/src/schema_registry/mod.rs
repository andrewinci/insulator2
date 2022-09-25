use url::Url;
use serde::{ de::DeserializeOwned, Deserialize, Serialize };

use crate::{ configuration::model::SchemaRegistry, error::{ Result, TauriError } };

async fn get<T: DeserializeOwned>(url: String, config: &SchemaRegistry) -> Result<T> {
    println!("{}", url);
    let client = reqwest::Client::new();
    let mut request = client.get(url);
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
pub async fn get_schema(subject_name: String, config: SchemaRegistry) -> Result<Schema> {
    let url = Url::parse(&config.endpoint)?.join(
        format!("/subjects/{}/versions/", subject_name).as_str()
    )?;
    let versions: Vec<i32> = get(url.to_string(), &config).await?;
    if let Some(latest_version) = versions.iter().max() {
        let latest_schema_url = url.join(&latest_version.to_string())?;
        let latest_schema: Schema = get(latest_schema_url.to_string(), &config).await?;
        Ok(latest_schema)
    } else {
        Err(TauriError {
            error_type: "Schema registry".to_string(),
            message: format!("No versions found for subject {:}", subject_name),
        })
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Schema {
    subject: String,
    id: i32,
    version: i32,
    schema: String,
}