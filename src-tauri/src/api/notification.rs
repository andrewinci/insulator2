use tauri::{ AppHandle, Manager };

use super::error::TauriError;

pub fn notify_error(error_type: String, message: String, app: AppHandle) {
    app.app_handle()
        .emit_all("error", TauriError {
            error_type,
            message,
        })
        .expect("unable to send a notification to the frontend");
}