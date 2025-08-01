use tauri::{AppHandle, Emitter, Manager};

use super::error::ApiError;

pub fn _notify_error(error_type: &str, message: &str, app: &AppHandle) {
    app.app_handle()
        .emit(
            "error",
            ApiError {
                error_type: error_type.to_string(),
                message: message.to_string(),
            },
        )
        .expect("unable to send a notification to the frontend");
}
