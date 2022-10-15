use log::debug;

use super::error::Result;
use crate::lib::{ ConfigStore, InsulatorConfig };

#[tauri::command]
pub fn get_configuration() -> Result<InsulatorConfig> {
    debug!("Retrieve configuration");
    Ok(ConfigStore::new().get_configuration()?)
}

#[tauri::command]
pub fn write_configuration(configuration: InsulatorConfig) -> Result<InsulatorConfig> {
    debug!("Write configuration");
    Ok(
        ConfigStore::new()
            .write_configuration(&configuration)
            .map(|_| configuration)?
    )
}