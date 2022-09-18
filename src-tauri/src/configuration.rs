use std::{
    fs::File,
    io::{Read, Write},
};

use dirs::home_dir;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct InsulatorConfig {
    clusters: Vec<Cluster>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Cluster {
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
    }
}

fn get_config_file() -> File {
    let mut config_path = home_dir().expect("Unable to retrieve the home directory");
    config_path.push(".insulator2.config");
    let config_file = File::options()
        .read(true)
        .write(true)
        .create(true)
        .open(&config_path)
        .expect(
            format!(
                "Unable to open or create the file at {}",
                config_path.display().to_string()
            )
            .as_str(),
        );
    config_file
}

pub fn get_configuration() -> Result<InsulatorConfig, String> {
    let mut config_file = get_config_file();
    // read file content
    let mut raw_config = String::new();
    config_file
        .read_to_string(&mut raw_config)
        .expect("Unable to read the config file");

    if raw_config == "" {
        Ok(default_config())
    } else {
        match serde_json::from_str::<InsulatorConfig>(&raw_config) {
            Ok(res) => Ok(res),
            Err(err) => Err(format!("Unable to deserialize the configuration. {}", err)),
        }
    }
}

pub fn add_cluster(new_cluster: Cluster) -> Result<InsulatorConfig, String> {
    let mut config = get_configuration()?;
    if config.clusters.iter().any(|c| c.name == new_cluster.name) {
        Err(format!(
            "Cluster \"{}\" already exists. Use another name.",
            new_cluster.name
        ))
    } else {
        config.clusters.push(new_cluster);
        write_configuration(&config);
        Ok(config)
    }
}

fn write_configuration(configuration: &InsulatorConfig) {
    let mut config_file = get_config_file();
    match serde_json::to_string_pretty(&configuration) {
        Ok(res) => {
            config_file
                .write_all(res.as_bytes())
                .expect("Unable to write the file");
        }
        Err(err) => panic!("Unable to update the configuration. {}", err),
    };
}
