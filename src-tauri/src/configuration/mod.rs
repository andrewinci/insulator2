use std::path::PathBuf;
use std::{ fs, path::Path };

use dirs::home_dir;
pub mod insulator_config;
use crate::error::{ Result };
pub use self::insulator_config::{ InsulatorConfig, Authentication, Cluster, SchemaRegistry };

#[tauri::command]
pub fn get_configuration() -> Result<InsulatorConfig> {
    let config_path = config_path();
    let raw_config = (match Path::exists(&config_path) {
        // read file content
        true => fs::read_to_string(config_path),
        // if the file doesn't exists return an empty string
        false => Ok("".to_owned()),
    })?;
    match raw_config.as_str() {
        "" => Ok(InsulatorConfig::default()),
        _ => Ok(serde_json::from_str::<InsulatorConfig>(&raw_config)?),
    }
}

#[tauri::command]
pub fn write_configuration(configuration: InsulatorConfig) -> Result<InsulatorConfig> {
    let config_path = config_path();
    let raw_config = serde_json::to_string_pretty(&configuration)?;
    fs::write(config_path, raw_config)?;
    Ok(configuration)
}

fn config_path() -> PathBuf {
    let mut config_path = home_dir().expect("Unable to retrieve the home directory");
    config_path.push(".insulator2.config");
    config_path
}