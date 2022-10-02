use serde::{ Serialize, Deserialize };
use tauri::{ Manager, AppHandle };

use crate::error::TauriError;

use super::state::ConsumerInfo;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Event {
    consumer: ConsumerInfo,
    records_count: usize,
}

pub fn notify_error(error: TauriError, app: &AppHandle) {
    app.app_handle().emit_all("error", error).expect("unable to send a notification to the frontend");
}