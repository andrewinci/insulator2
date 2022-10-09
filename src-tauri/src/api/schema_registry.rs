use log::debug;
use crate::lib::schema_registry::Schema;

use super::{ error::{ Result, TauriError }, AppState };

#[tauri::command]
pub async fn list_subjects(cluster_id: String, state: tauri::State<'_, AppState>) -> Result<Vec<String>> {
    debug!("List schema schema registry subjects");
    Ok(
        state
            .get_by_cluster_id(&cluster_id).await
            .schema_registry_client.ok_or(TauriError {
                error_type: "Configuration error".into(),
                message: "Missing schema registry configuration".into(),
            })?
            .list_subjects().await?
    )
}

#[tauri::command]
pub async fn get_schema(
    subject_name: String,
    cluster_id: String,
    state: tauri::State<'_, AppState>
) -> Result<Vec<Schema>> {
    debug!("Retrieve all schema version for subject {}", subject_name);
    Ok(
        state
            .get_by_cluster_id(&cluster_id).await
            .schema_registry_client.ok_or(TauriError {
                error_type: "Configuration error".into(),
                message: "Missing schema registry configuration".into(),
            })?
            .get_schema(subject_name).await?
    )
}