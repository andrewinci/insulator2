use super::error::Result;
use super::AppState;
use crate::api::notification::{notify_action_complete, ActionCompleteEvent};
use log::debug;
use tokio::spawn;

#[tauri::command]
pub async fn export_datastore(
    cluster_id: &str,
    output_path: &str,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<()> {
    debug!("Start export database");
    let cluster = state.get_cluster(cluster_id).await;
    let store = cluster.store.to_owned();
    let output_path = output_path.to_owned();
    let cluster_id = cluster_id.to_owned();
    spawn({
        async move {
            notify_action_complete(
                &ActionCompleteEvent {
                    action: "export_datastore".into(),
                    id: format!("{}-{}", cluster_id, output_path),
                    result: store.export_db(&output_path).into(),
                },
                &app_handle,
            )
        }
    });
    Ok(())
}
