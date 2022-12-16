use log::debug;

use crate::lib::configuration::{ConfigStore, InsulatorConfig};

use super::error::Result;

#[tauri::command]
pub fn get_configuration() -> Result<InsulatorConfig> {
    debug!("Retrieve configuration");
    Ok(ConfigStore::new().get_configuration()?)
}

#[tauri::command]
pub fn write_configuration(configuration: InsulatorConfig) -> Result<InsulatorConfig> {
    debug!("Write configuration");
    Ok(ConfigStore::new()
        .write_configuration(&configuration)
        .map(|_| configuration)?)
}
