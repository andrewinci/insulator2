use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct InsulatorConfig {
    pub clusters: Vec<ClusterConfig>,
    pub theme: Option<Theme>,
    #[serde(rename = "showNotifications")]
    pub show_notifications: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Theme {
    Dark,
    Light,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ClusterConfig {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub authentication: AuthenticationConfig,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistryConfig>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
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
    },
    #[default]
    None,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SchemaRegistryConfig {
    pub endpoint: String,
    pub username: Option<String>,
    pub password: Option<String>,
}
