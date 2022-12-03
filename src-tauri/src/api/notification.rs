use std::fmt::Debug;

use serde::Serialize;
use tauri::{AppHandle, Manager};

use super::error::TauriError;

#[derive(Serialize, Clone, Debug)]
pub enum ActionResult<T: Serialize + Clone + Debug> {
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
    pub action: String,
    pub id: String,
    pub result: ActionResult<T>,
}

pub fn notify_action_complete<T: Serialize + Clone + Debug>(event: &ActionCompleteEvent<T>, app_handle: &AppHandle) {
    app_handle
        .app_handle()
        .emit_all("action_status", event)
        .expect("unable to send the action complete event to the frontend");
}

pub fn _notify_error(error_type: &str, message: &str, app: &AppHandle) {
    app.app_handle()
        .emit_all(
            "error",
            TauriError {
                error_type: error_type.to_string(),
                message: message.to_string(),
            },
        )
        .expect("unable to send a notification to the frontend");
}
