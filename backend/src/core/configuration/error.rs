#[derive(Debug)]
pub enum ConfigError {
    IO(String),
    JSONSerde(String),
    TOMLSerde(String),
    LegacyConfiguration(String),
    ClusterNotFound(String),
}

pub type ConfigResult<T> = Result<T, ConfigError>;

impl From<std::io::Error> for ConfigError {
    fn from(error: std::io::Error) -> Self {
        ConfigError::IO(error.to_string())
    }
}

impl From<serde_json::Error> for ConfigError {
    fn from(error: serde_json::Error) -> Self {
        ConfigError::JSONSerde(error.to_string())
    }
}

impl From<toml::de::Error> for ConfigError {
    fn from(error: toml::de::Error) -> Self {
        ConfigError::TOMLSerde(error.to_string())
    }
}

impl From<toml::ser::Error> for ConfigError {
    fn from(error: toml::ser::Error) -> Self {
        ConfigError::TOMLSerde(error.to_string())
    }
}

impl From<rust_keystore::error::Error> for ConfigError {
    fn from(err: rust_keystore::error::Error) -> Self {
        Self::LegacyConfiguration(format!("{err:?}"))
    }
}
