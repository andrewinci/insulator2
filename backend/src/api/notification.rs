use tauri::{AppHandle, Manager};

use super::error::TauriError;

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
