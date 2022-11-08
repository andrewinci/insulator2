use super::InsulatorConfig;
use crate::lib::error::Result;
use dirs::home_dir;
use std::path::PathBuf;
use std::{fs, path::Path};

#[derive(Default)]
pub struct ConfigStore {
    config_path: PathBuf,
}

impl ConfigStore {
    //todo: cache?
    pub fn new() -> Self {
        let mut config_path = home_dir().expect("Unable to retrieve the home directory");
        config_path.push(".insulator2.config");
        ConfigStore { config_path }
    }

    fn from_config_path(config_path: &str) -> Self {
        ConfigStore {
            config_path: PathBuf::from(config_path),
        }
    }

    pub fn get_configuration(&self) -> Result<InsulatorConfig> {
        let raw_config = (match Path::exists(&self.config_path) {
            // read file content
            true => fs::read_to_string(&self.config_path),
            // if the file doesn't exists return an empty string
            false => Ok("".to_owned()),
        })?;
        match raw_config.as_str() {
            "" => Ok(InsulatorConfig::default()),
            _ => Ok(serde_json::from_str::<InsulatorConfig>(&raw_config)?),
        }
    }

    pub fn write_configuration(&self, configuration: &InsulatorConfig) -> Result<()> {
        // validate input
        configuration.clusters.iter().for_each(|c| {
            assert!(!c.endpoint.is_empty());
            match &c.schema_registry {
                Some(s) => assert!(!s.endpoint.is_empty()),
                None => {}
            };
        });
        let raw_config = serde_json::to_string_pretty(&configuration)?;
        fs::write(&self.config_path, raw_config)?;
        Ok(())
    }
}

#[cfg(test)]
mod test_configuration {
    use super::ConfigStore;

    #[test]
    fn retrieve_empty_config() {
        let sut = ConfigStore::from_config_path("/tmp/insulator_test/config");
        let res = sut.get_configuration();
        assert!(res.is_ok())
    }
}
