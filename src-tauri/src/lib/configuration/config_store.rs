use crate::lib::error::Result;
use super::InsulatorConfig;
use dirs::home_dir;
use std::path::PathBuf;
use std::{ fs, path::Path };

pub struct ConfigStore {}

impl ConfigStore {
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

    pub fn write_configuration(configuration: &InsulatorConfig) -> Result<()> {
        let config_path = config_path();
        let raw_config = serde_json::to_string_pretty(&configuration)?;
        fs::write(config_path, raw_config)?;
        Ok(())
    }
}

fn config_path() -> PathBuf {
    let mut config_path = home_dir().expect("Unable to retrieve the home directory");
    config_path.push(".insulator2.config");
    config_path
}