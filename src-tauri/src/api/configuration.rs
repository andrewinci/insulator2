use crate::configuration::{ ConfigStore, Error, InsulatorConfig };
use crate::error::{ Result, TauriError };

#[tauri::command]
pub fn get_configuration() -> Result<InsulatorConfig> {
    Ok(ConfigStore::get_configuration()?)
}

#[tauri::command]
pub fn write_configuration(configuration: InsulatorConfig) -> Result<InsulatorConfig> {
    Ok(ConfigStore::write_configuration(&configuration).map(|_| configuration)?)
}

impl From<Error> for TauriError {
    fn from(err: Error) -> Self {
        match err {
            Error::IOError { message } =>
                TauriError {
                    error_type: "IO error".into(),
                    message,
                },
            Error::JSONSerdeError { message } =>
                TauriError {
                    error_type: "JSON serialization error".into(),
                    message,
                },
        }
    }
}