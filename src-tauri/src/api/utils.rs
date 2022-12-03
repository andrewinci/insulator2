use log::debug;
use serde::Serialize;
use tauri::{AppHandle, Manager};
use tokio::spawn;

use super::error::{Result, TauriError};
use super::AppState;

#[derive(Serialize, Clone, Debug)]
pub enum ActionStatus {
    Success,
    Fail(TauriError),
}

#[derive(Serialize, Clone, Debug)]
pub struct ActionCompleteEvent {
    action: String,
    id: String,
    status: ActionStatus,
}

pub fn notify_action_complete(event: ActionCompleteEvent, app_handle: &AppHandle) {
    app_handle
        .app_handle()
        .emit_all("action_status", event)
        .expect("unable to send the action complete event to the frontend");
}

#[tauri::command]
pub async fn export_datastore(
    cluster_id: &str,
    output_path: &str,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<()> {
    debug!("Start export database");
    let cluster = state.get_cluster(cluster_id).await;
    spawn({
        let store = cluster.store.clone();
        let output_path = output_path.to_owned();
        let cluster_id = cluster_id.to_owned();
        async move {
            let res = store.export_db(&output_path);
            notify_action_complete(
                ActionCompleteEvent {
                    action: "export_datastore".into(),
                    id: format!("{}-{}", cluster_id, output_path),
                    status: match res {
                        Ok(_) => ActionStatus::Success,
                        Err(err) => ActionStatus::Fail(err.into()),
                    },
                },
                &app_handle,
            )
        }
    });
    Ok(())
}
