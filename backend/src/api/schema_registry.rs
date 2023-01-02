use crate::lib::schema_registry::Subject;
use log::debug;

use super::{
    error::{ApiError, ApiResult},
    AppState,
};

#[tauri::command]
pub async fn list_subjects(cluster_id: &str, state: tauri::State<'_, AppState>) -> ApiResult<Vec<String>> {
    debug!("List schema schema registry subjects");
    let client = state.get_schema_reg_client(cluster_id).await?.ok_or(ApiError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.list_subjects().await?)
}

#[tauri::command]
pub async fn get_subject(subject_name: &str, cluster_id: &str, state: tauri::State<'_, AppState>) -> ApiResult<Subject> {
    debug!("Retrieve all schema version for subject {}", subject_name);
    let client = state.get_schema_reg_client(cluster_id).await?.ok_or(ApiError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.get_subject(subject_name).await?)
}

#[tauri::command]
pub async fn delete_subject(subject_name: &str, cluster_id: &str, state: tauri::State<'_, AppState>) -> ApiResult<()> {
    debug!("Deleting subject {}", subject_name);
    let client = state.get_schema_reg_client(cluster_id).await?.ok_or(ApiError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.delete_subject(subject_name).await?)
}

#[tauri::command]
pub async fn delete_subject_version(
    subject_name: &str,
    version: i32,
    cluster_id: &str,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    debug!("Deleting subject {} version {}", subject_name, version);
    let client = state.get_schema_reg_client(cluster_id).await?.ok_or(ApiError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.delete_version(subject_name, version).await?)
}

#[tauri::command]
pub async fn post_schema(
    subject_name: &str,
    schema: &str,
    cluster_id: &str,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    debug!("Create subject {}", subject_name);
    let client = state.get_schema_reg_client(cluster_id).await?.ok_or(ApiError {
        error_type: "Configuration error".into(),
        message: "Missing schema registry configuration".into(),
    })?;
    Ok(client.post_schema(subject_name, schema).await?)
}
