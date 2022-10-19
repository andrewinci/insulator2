use crate::lib::schema_registry::{Schema, SchemaRegistryClient};
use log::debug;

use super::{
    error::{Result, TauriError},
    AppState,
};

#[tauri::command]
pub async fn list_subjects(cluster_id: &str, state: tauri::State<'_, AppState>) -> Result<Vec<String>> {
    debug!("List schema schema registry subjects");
    let client = state.get_schema_reg_client(cluster_id).await.ok_or(TauriError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.list_subjects().await?)
}

#[tauri::command]
pub async fn get_schema(subject_name: &str, cluster_id: &str, state: tauri::State<'_, AppState>) -> Result<Vec<Schema>> {
    debug!("Retrieve all schema version for subject {}", subject_name);
    let client = state.get_schema_reg_client(cluster_id).await.ok_or(TauriError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.get_schema(subject_name).await?)
}
