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
    pub fn new() -> Self {
        let mut config_path = home_dir().expect("Unable to retrieve the home directory");
        config_path.push(".insulator2.config");
        ConfigStore { config_path }
    }

    #[cfg(test)]
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
    use std::{env::temp_dir, fs};

    use crate::lib::configuration::InsulatorConfig;

    use super::ConfigStore;

    fn get_test_config_path() -> String {
        let mut dir = temp_dir();
        dir.push("test_config");
        dir.to_str().unwrap().into()
    }

    #[test]
    fn test_retrieve_config() {
        let tmp_config_file = get_test_config_path();
        let sut = ConfigStore::from_config_path(&tmp_config_file);

        // retrieve config the first time returns the default
        {
            fs::remove_file(&tmp_config_file).ok();
            let res = sut.get_configuration();
            assert!(res.is_ok());
            assert_eq!(res.unwrap(), InsulatorConfig::default());
        }

        // retrieve an invalid config returns an error
        {
            fs::write(&tmp_config_file, b"123321").expect("Unable to create the fake file");
            let res = sut.get_configuration();
            assert!(res.is_err());
        }
    }

    #[test]
    fn test_write_config() {
        let sut = ConfigStore::from_config_path(&get_test_config_path());
        let res = sut.write_configuration(&InsulatorConfig::default());
        assert!(res.is_ok())
    }
}
