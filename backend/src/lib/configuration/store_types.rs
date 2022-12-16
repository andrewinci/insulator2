use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::{AuthenticationConfig, ClusterConfig, Favorites, InsulatorConfig, SchemaRegistryConfig, Theme};

#[derive(Serialize, Deserialize, Debug, Default, PartialEq, Eq)]
pub struct StoreConfig {
    pub theme: Theme,
    #[serde(rename = "showNotifications")]
    pub show_notifications: bool,
    #[serde(rename = "useRegex")]
    pub use_regex: bool,
    #[serde(rename = "sqlTimeoutSeconds")]
    pub sql_timeout_secs: Option<u32>,
    pub clusters: HashMap<String, StoreCluster>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
pub struct StoreCluster {
    pub name: String,
    pub endpoint: String,
    pub authentication: StoreAuthentication,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistryConfig>,
    pub favorites: Option<Favorites>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
#[serde(tag = "type")]
pub enum StoreAuthentication {
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

impl From<StoreAuthentication> for AuthenticationConfig {
    fn from(s: StoreAuthentication) -> Self {
        match s {
            StoreAuthentication::Ssl {
                ca,
                certificate,
                key,
                key_password,
            } => AuthenticationConfig::Ssl {
                ca,
                certificate,
                key,
                key_password,
            },
            StoreAuthentication::Sasl {
                username,
                password,
                scram,
            } => AuthenticationConfig::Sasl {
                username,
                password,
                scram,
            },
            StoreAuthentication::None => AuthenticationConfig::None,
        }
    }
}

fn store_cluster_to_config(id: String, store: StoreCluster) -> ClusterConfig {
    ClusterConfig {
        id,
        name: store.name,
        endpoint: store.endpoint,
        authentication: store.authentication.into(),
        schema_registry: store.schema_registry,
        favorites: store.favorites.unwrap_or_default(),
    }
}

impl From<StoreConfig> for InsulatorConfig {
    fn from(
        StoreConfig {
            theme,
            show_notifications,
            use_regex,
            clusters,
            sql_timeout_secs,
        }: StoreConfig,
    ) -> Self {
        let converted_clusters = clusters
            .into_iter()
            .map(|(id, c)| store_cluster_to_config(id, c))
            .collect();
        InsulatorConfig {
            theme,
            show_notifications,
            use_regex,
            sql_timeout_secs: sql_timeout_secs.unwrap_or(10),
            clusters: converted_clusters,
        }
    }
}

impl From<AuthenticationConfig> for StoreAuthentication {
    fn from(authentication_config: AuthenticationConfig) -> Self {
        match authentication_config {
            AuthenticationConfig::Ssl {
                ca,
                certificate,
                key,
                key_password,
            } => StoreAuthentication::Ssl {
                ca,
                certificate,
                key,
                key_password,
            },
            AuthenticationConfig::Sasl {
                username,
                password,
                scram,
            } => StoreAuthentication::Sasl {
                username,
                password,
                scram,
            },
            AuthenticationConfig::None => StoreAuthentication::None,
        }
    }
}

impl From<ClusterConfig> for StoreCluster {
    fn from(config: ClusterConfig) -> Self {
        StoreCluster {
            name: config.name,
            endpoint: config.endpoint,
            authentication: config.authentication.into(),
            schema_registry: config.schema_registry,
            favorites: Some(config.favorites),
        }
    }
}

impl From<&InsulatorConfig> for StoreConfig {
    fn from(config: &InsulatorConfig) -> Self {
        StoreConfig {
            theme: config.theme,
            show_notifications: config.show_notifications,
            use_regex: config.use_regex,
            sql_timeout_secs: Some(config.sql_timeout_secs),
            clusters: config
                .clusters
                .clone()
                .into_iter()
                .map(|c| (c.id.clone(), c.into()))
                .collect(),
        }
    }
}
