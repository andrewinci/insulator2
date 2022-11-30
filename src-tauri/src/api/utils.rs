use log::debug;

use super::error::Result;
use super::AppState;

#[tauri::command]
pub async fn export_datastore(cluster_id: &str, output_path: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    debug!("Start export database");
    Ok(state.get_cluster(cluster_id).await.store.export_db(output_path)?)
}
