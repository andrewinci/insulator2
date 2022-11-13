use serde::{Deserialize, Serialize};

use super::Theme;

#[derive(Debug, Default, Serialize, Deserialize)]
struct Configuration {
    clusters: Vec<Cluster>,
    theme: Theme,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct Cluster {
    pub guid: String,
    pub name: String,
    pub endpoint: String,

    #[serde(rename = "useSSL")]
    pub use_ssl: bool,
    #[serde(rename = "sslConfiguration")]
    pub ssl_configuration: SslConfiguration,

    #[serde(rename = "useSasl")]
    pub use_sasl: bool,
    #[serde(rename = "saslConfiguration")]
    pub sasl_configuration: SaslConfiguration,

    #[serde(rename = "schemaRegistryConfig")]
    schema_registry_config: SchemaRegistryConfiguration,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct SslConfiguration {
    #[serde(rename = "sslTruststoreLocation")]
    pub ssl_truststore_location: String,
    #[serde(rename = "sslTruststorePassword")]
    pub ssl_truststore_password: String,
    #[serde(rename = "sslKeystoreLocation")]
    pub ssl_keystore_location: String,
    #[serde(rename = "sslKeyStorePassword")]
    pub ssl_keyStore_password: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct SaslConfiguration {
    #[serde(rename = "saslUsername")]
    pub sasl_username: String,
    #[serde(rename = "saslPassword")]
    pub sasl_password: String,
    #[serde(rename = "useScram")]
    pub use_scram: Boolean,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct SchemaRegistryConfiguration {
    pub endpoint: String,
    pub username: String,
    pub password: String,
}