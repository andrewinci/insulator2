use std::path::PathBuf;
use std::{ fs, path::Path };

use dirs::home_dir;
use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize, Debug)]
pub struct InsulatorConfig {
    clusters: Vec<Cluster>,
    theme: Option<Theme>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Theme {
    Dark,
    Light,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Cluster {
    id: String,
    name: String,
    endpoint: String,
    authentication: Authentication,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Authentication {
    Ssl {},
    Sasl {
        username: String,
        password: String,
        scram: bool,
    },
    None,
}

fn default_config() -> InsulatorConfig {
    InsulatorConfig {
        clusters: Vec::new(),
        theme: Some(Theme::Light),
    }
}

fn config_path() -> PathBuf {
    let mut config_path = home_dir().expect("Unable to retrieve the home directory");
    config_path.push(".insulator2.config");
    config_path
}

pub fn get_configuration() -> Result<InsulatorConfig, String> {
    let config_path = config_path();
    let raw_config = (match Path::exists(&config_path) {
        // read file content
        true =>
            fs
                ::read_to_string(config_path)
                .map_err(|err| format!("Unable to read the configuration file. {}", err)),
        // if the file doesn't exists return an empty string
        false => Ok("".to_owned()),
    })?;

    if raw_config == "" {
        Ok(default_config())
    } else {
        match serde_json::from_str::<InsulatorConfig>(&raw_config) {
            Ok(res) => Ok(res),
            Err(err) => Err(format!("Unable to deserialize the configuration. {}", err)),
        }
    }
}

pub fn write_configuration(configuration: &InsulatorConfig) -> Result<(), String> {
    let config_path = config_path();
    serde_json
        ::to_string_pretty(&configuration)
        .map_err(|err| format!("Unable to serialize the configuration. {}", err))
        .and_then(|res| {
            fs::write(config_path, res).map_err(|err|
                format!("Unable to store the new configuration. {}", err)
            )
        })
        .and_then(|_| Ok(()))
}