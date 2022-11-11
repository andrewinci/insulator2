use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default, PartialEq, Eq)]
pub struct InsulatorConfig {
    pub clusters: HashMap<String, ClusterConfig>,
    pub theme: Option<Theme>,
    #[serde(rename = "showNotifications")]
    pub show_notifications: Option<bool>,
    #[serde(rename = "useRegex")]
    pub use_regex: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
pub enum Theme {
    Dark,
    Light,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
pub struct ClusterConfig {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub authentication: Option<AuthenticationConfig>,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistryConfig>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum AuthenticationConfig {
    Ssl {
        ca: String,
        certificate: String,
        key: String,
        #[serde(rename = "keyPassword")]
        key_password: Option<String>,
    },
    Sasl {
        username: String,
        password: String,
        scram: bool,
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct SchemaRegistryConfig {
    pub endpoint: String,
    pub username: Option<String>,
    pub password: Option<String>,
}
