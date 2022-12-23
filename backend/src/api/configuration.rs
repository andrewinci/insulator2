use log::debug;

use crate::lib::configuration::InsulatorConfig;

use super::{ error::Result, AppState };

#[tauri::command]
pub fn get_configuration(state: tauri::State<'_, AppState>) -> Result<InsulatorConfig> {
    debug!("Retrieve configuration");
    Ok(state.configuration_provider.get_configuration()?)
}

#[tauri::command]
pub fn write_configuration(
    configuration: InsulatorConfig,
    state: tauri::State<'_, AppState>
) -> Result<InsulatorConfig> {
    debug!("Write configuration");
    Ok(state.configuration_provider.write_configuration(&configuration).map(|_| configuration)?)
}