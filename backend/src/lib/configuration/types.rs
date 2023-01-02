use std::time::Duration;

use crate::lib::{LibError, LibResult};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
pub struct InsulatorConfig {
    pub theme: Theme,
    #[serde(rename = "showNotifications")]
    pub show_notifications: bool,
    #[serde(rename = "useRegex")]
    pub use_regex: bool,
    #[serde(rename = "sqlTimeoutSeconds")]
    pub sql_timeout_secs: u32,
    #[serde(rename = "kafkaTimeoutSeconds")]
    pub kafka_timeout_secs: u32,
    pub clusters: Vec<ClusterConfig>,
}

impl InsulatorConfig {
    pub fn get_kafka_tmo(&self) -> Duration {
        Duration::from_secs(self.kafka_timeout_secs as u64)
    }
    pub fn get_sql_tmo(&self) -> Duration {
        Duration::from_secs(self.sql_timeout_secs as u64)
    }
    pub fn get_cluster_config(&self, cluster_id: &str) -> LibResult<ClusterConfig> {
        self.clusters
            .iter()
            .find(|c| c.id == cluster_id)
            .cloned()
            .ok_or(LibError::Generic {
                message: format!("Unable to load the configuration for the cluster {}", cluster_id),
            })
    }
}

impl Default for InsulatorConfig {
    fn default() -> Self {
        Self {
            show_notifications: true,
            use_regex: true,
            sql_timeout_secs: 10,
            clusters: vec![],
            kafka_timeout_secs: 20,
            theme: Theme::Dark,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Default, Clone, Copy)]
pub enum Theme {
    #[default]
    Dark,
    Light,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
pub struct ClusterConfig {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub authentication: AuthenticationConfig,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistryConfig>,
    pub favorites: Favorites,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
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

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct SchemaRegistryConfig {
    pub endpoint: String,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone, PartialEq, Eq)]
pub struct Favorites {
    pub topics: Vec<String>,
    pub schemas: Vec<String>,
    pub consumers: Vec<String>,
}
