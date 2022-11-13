use super::{AuthenticationConfig, ClusterConfig, InsulatorConfig, SchemaRegistryConfig, Theme};
use crate::lib::Result;
use serde::Deserialize;

// insulator v1 config
#[derive(Debug, Default, Deserialize)]
pub(crate) struct LegacyConfiguration {
    clusters: Vec<LegacyCluster>,
    theme: Theme,
}

#[derive(Debug, Default, Deserialize)]
struct LegacyCluster {
    pub guid: String,
    pub name: String,
    pub endpoint: String,

    #[serde(rename = "useSSL")]
    pub use_ssl: bool,
    #[serde(rename = "sslConfiguration")]
    pub ssl_configuration: Option<SslConfigurationLegacy>,

    #[serde(rename = "useSasl")]
    pub use_sasl: bool,
    #[serde(rename = "saslConfiguration")]
    pub sasl_configuration: Option<SaslConfigurationLegacy>,

    #[serde(rename = "schemaRegistryConfig")]
    schema_registry_config: Option<SchemaRegistryConfigurationLegacy>,
}

#[derive(Debug, Default, Deserialize)]
struct SslConfigurationLegacy {
    #[serde(rename = "sslTruststoreLocation")]
    pub ssl_truststore_location: Option<String>,
    #[serde(rename = "sslTruststorePassword")]
    pub ssl_truststore_password: Option<String>,
    #[serde(rename = "sslKeystoreLocation")]
    pub ssl_keystore_location: Option<String>,
    #[serde(rename = "sslKeyStorePassword")]
    pub ssl_keystore_password: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
struct SaslConfigurationLegacy {
    #[serde(rename = "saslUsername")]
    pub sasl_username: Option<String>,
    #[serde(rename = "saslPassword")]
    pub sasl_password: Option<String>,
    #[serde(rename = "useScram")]
    pub use_scram: Option<bool>,
}

#[derive(Debug, Default, Deserialize)]
struct SchemaRegistryConfigurationLegacy {
    pub endpoint: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl TryFrom<LegacyConfiguration> for InsulatorConfig {
    type Error = crate::lib::Error;

    fn try_from(legacy: LegacyConfiguration) -> std::result::Result<Self, Self::Error> {
        let mut config = InsulatorConfig::default();
        config.theme = legacy.theme;
        config.use_regex = false;
        config.show_notifications = true;
        let mut clusters = Vec::new();
        for c in legacy.clusters {
            let schema_registry = c.schema_registry_config.and_then(|s| map_schema_registry(s));
            let authentication = if c.use_sasl && c.sasl_configuration.is_some() {
                map_sasl_config(c.sasl_configuration.unwrap())
            } else if c.use_ssl && c.ssl_configuration.is_some() {
                map_ssl_config(c.ssl_configuration.unwrap())
            } else {
                Ok(AuthenticationConfig::None)
            }?;

            clusters.push(ClusterConfig {
                id: c.guid.clone(),
                name: c.name.clone(),
                endpoint: c.endpoint.clone(),
                authentication,
                schema_registry,
            })
        }
        config.clusters = clusters;
        Ok(config)
    }
}

fn map_sasl_config(legacy: SaslConfigurationLegacy) -> Result<AuthenticationConfig> {
    if let (Some(username), Some(password)) = (legacy.sasl_username, legacy.sasl_password) {
        Ok(AuthenticationConfig::Sasl {
            username,
            password,
            scram: legacy.use_scram.unwrap_or(false),
        })
    } else {
        Err(crate::lib::Error::LegacyConfig {
            message: "Invalid sasl configuration found. Username and password must be non-empty".into(),
        })
    }
}

fn map_ssl_config(legacy: SslConfigurationLegacy) -> Result<AuthenticationConfig> {
    let jks_parser = rust_jks::KeyStoreParser::new();
    if let (Some(truststore_location), Some(keystore_location)) =
        (legacy.ssl_truststore_location, legacy.ssl_keystore_location)
    {
        let truststore = jks_parser
            .load(&truststore_location, legacy.ssl_truststore_password.as_deref())
            .unwrap();
        let keystore = jks_parser
            .load(&keystore_location, legacy.ssl_truststore_password.as_deref())
            .unwrap();
        Ok(AuthenticationConfig::Ssl {
            ca: truststore.certs[0].pem.clone(),
            certificate: keystore.private_keys[0].cert_chain[0].pem.clone(),
            key: keystore.private_keys[0].pem.clone(),
            key_password: None,
        })
    } else {
        Err(crate::lib::Error::LegacyConfig {
            message: "Invalid ssl configuration found. truststore and keystore locations are required".into(),
        })
    }
}

fn map_schema_registry(legacy: SchemaRegistryConfigurationLegacy) -> Option<SchemaRegistryConfig> {
    if let Some(endpoint) = legacy.endpoint {
        Some(SchemaRegistryConfig {
            endpoint,
            username: legacy.username.filter(|s| !s.is_empty()),
            password: legacy.password.filter(|s| !s.is_empty()),
        })
    } else {
        None
    }
}