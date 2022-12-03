use std::fmt::Debug;

use log::debug;
use serde::Serialize;
use tauri::{AppHandle, Manager};
use tokio::spawn;

use super::error::{Result, TauriError};
use super::AppState;

#[derive(Serialize, Clone, Debug)]
enum ActionResult<T: Serialize + Clone + Debug> {
    Ok(T),
    Err(TauriError),
}

impl<T: Serialize + Clone + Debug> From<crate::lib::Result<T>> for ActionResult<T> {
    fn from(r: crate::lib::Result<T>) -> Self {
        match r {
            Ok(v) => Self::Ok(v),
            Err(e) => Self::Err(e.into()),
        }
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct ActionCompleteEvent<T: Serialize + Clone + Debug> {
    action: String,
    id: String,
    result: ActionResult<T>,
}

pub fn notify_action_complete<T: Serialize + Clone + Debug>(event: &ActionCompleteEvent<T>, app_handle: &AppHandle) {
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
