use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct InsulatorConfig {
    pub clusters: Vec<Cluster>,
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
pub struct Cluster {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub authentication: Authentication,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistry>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub enum Authentication {
    Ssl {
        #[serde(rename = "caLocation")]
        ca_location: String,
        #[serde(rename = "certificateLocation")]
        certificate_location: String,
        #[serde(rename = "keyLocation")]
        key_location: String,
        #[serde(rename = "keyPassword")]
        key_password: Option<String>,
    },
    Sasl {
        username: String,
        password: String,
        scram: bool,
    },
    #[default] None,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SchemaRegistry {
    pub endpoint: String,
    pub username: Option<String>,
    pub password: Option<String>,
}