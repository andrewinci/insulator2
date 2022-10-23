use rdkafka::ClientConfig;

use crate::lib::configuration::{AuthenticationConfig, ClusterConfig};

pub fn build_kafka_client_config(cluster: &ClusterConfig, group_id: Option<&str>) -> ClientConfig {
    //todo: try to use as less threads as possible for each consumer created
    let mut config = ClientConfig::new();
    let group_id = group_id.unwrap_or("insulator-2");
    config
        .set("bootstrap.servers", &cluster.endpoint)
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "false")
        .set("enable.auto.offset.store", "false")
        .set("offset.store.method", "broker")
        .set("group.id", group_id)
        .set("api.version.request", "true")
        .set("debug", "all");
    match &cluster.authentication {
        AuthenticationConfig::None => {
            config.set("security.protocol", "PLAINTEXT");
        }
        AuthenticationConfig::Sasl {
            username,
            password,
            scram,
        } => {
            config
                .set("security.protocol", "SASL_SSL")
                .set("sasl.mechanisms", if *scram { "SCRAM-SHA-256" } else { "PLAIN" })
                .set("ssl.endpoint.identification.algorithm", "https")
                .set("sasl.username", username)
                .set("sasl.password", password);
        }

        AuthenticationConfig::Ssl {
            ca,
            certificate,
            key,
            key_password,
        } => {
            config
                .set("security.protocol", "ssl")
                .set("ssl.ca.pem", ca)
                .set("ssl.certificate.pem", certificate)
                .set("ssl.key.pem", key);

            if let Some(password) = key_password {
                config.set("ssl.key.password", password);
            }
        }
    }
    config
}
