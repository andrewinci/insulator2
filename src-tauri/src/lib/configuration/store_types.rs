use serde::{Deserialize, Serialize};

use super::{AuthenticationConfig, ClusterConfig, InsulatorConfig, SchemaRegistryConfig, Theme};

#[derive(Serialize, Deserialize, Debug, Default, PartialEq, Eq)]
pub struct StoreConfig {
    pub theme: Theme,
    #[serde(rename = "showNotifications")]
    pub show_notifications: bool,
    #[serde(rename = "useRegex")]
    pub use_regex: bool,
    pub clusters: Vec<StoreCluster>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq)]
pub struct StoreCluster {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub authentication: StoreAuthentication,
    #[serde(rename = "schemaRegistry")]
    pub schema_registry: Option<SchemaRegistryConfig>,
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
                ca: ca,
                certificate: certificate,
                key: key,
                key_password: key_password,
            },
            StoreAuthentication::Sasl {
                username,
                password,
                scram,
            } => AuthenticationConfig::Sasl {
                username: username,
                password: password,
                scram: scram,
            },
            StoreAuthentication::None => AuthenticationConfig::None,
        }
    }
}

impl From<StoreCluster> for ClusterConfig {
    fn from(
        StoreCluster {
            id,
            name,
            endpoint,
            authentication,
            schema_registry,
        }: StoreCluster,
    ) -> Self {
        ClusterConfig {
            id: id,
            name: name,
            endpoint: endpoint,
            authentication: authentication.into(),
            schema_registry: schema_registry,
        }
    }
}

impl From<StoreConfig> for InsulatorConfig {
    fn from(
        StoreConfig {
            theme,
            show_notifications,
            use_regex,
            clusters,
        }: StoreConfig,
    ) -> Self {
        let converted_clusters = clusters.into_iter().map(|c| c.into()).collect();
        InsulatorConfig {
            theme: theme,
            show_notifications: show_notifications,
            use_regex: use_regex,
            clusters: converted_clusters,
        }
    }
}

impl Into<StoreAuthentication> for AuthenticationConfig {
    fn into(self) -> StoreAuthentication {
        match self {
            AuthenticationConfig::Ssl {
                ca,
                certificate,
                key,
                key_password,
            } => StoreAuthentication::Ssl {
                ca: ca,
                certificate: certificate,
                key: key,
                key_password: key_password,
            },
            AuthenticationConfig::Sasl {
                username,
                password,
                scram,
            } => StoreAuthentication::Sasl {
                username: username,
                password: password,
                scram: scram,
            },
            AuthenticationConfig::None => StoreAuthentication::None,
        }
    }
}

impl Into<StoreCluster> for ClusterConfig {
    fn into(self) -> StoreCluster {
        StoreCluster {
            id: self.id,
            name: self.name,
            endpoint: self.endpoint,
            authentication: self.authentication.into(),
            schema_registry: self.schema_registry,
        }
    }
}

impl Into<StoreConfig> for &InsulatorConfig {
    fn into(self) -> StoreConfig {
        let conf = self.clone();
        StoreConfig {
            theme: conf.theme,
            show_notifications: conf.show_notifications,
            use_regex: conf.use_regex,
            clusters: conf.clusters.clone().into_iter().map(|c| c.into()).collect(),
        }
    }
}
