use log::debug;

use crate::core::configuration::InsulatorConfig;

use super::{error::ApiResult, AppState};

#[tauri::command]
pub fn get_configuration(state: tauri::State<'_, AppState>) -> ApiResult<InsulatorConfig> {
    debug!("Retrieve configuration");
    Ok(state.configuration_provider.get_configuration()?)
}

#[tauri::command]
pub fn write_configuration(
    configuration: InsulatorConfig,
    state: tauri::State<'_, AppState>,
) -> ApiResult<InsulatorConfig> {
    debug!("Write configuration");
    Ok(state
        .configuration_provider
        .write_configuration(&configuration)
        .map(|_| configuration)?)
}
