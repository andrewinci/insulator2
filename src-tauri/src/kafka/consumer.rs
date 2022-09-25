use rdkafka::{ consumer::{ StreamConsumer }, ClientConfig };

use crate::{ configuration::model::{ Cluster, Authentication }, error::{ Result } };

pub(super) fn create_consumer(cluster: &Cluster) -> Result<StreamConsumer> {
    // todo: memoize
    let mut config = ClientConfig::new();
    config
        .set("enable.partition.eof", "true")
        .set("bootstrap.servers", &cluster.endpoint)
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "false")
        .set("group.id", "test-insulator")
        .set("api.version.request", "true")
        .set("debug", "all");

    match &cluster.authentication {
        Authentication::None => {
            config.set("security.protocol", "PLAINTEXT");
        }
        Authentication::Sasl { username, password, scram } => {
            config
                .set("security.protocol", "SASL_SSL")
                .set("sasl.mechanisms", if *scram { "SCRAM-SHA-256" } else { "PLAIN" })
                .set("ssl.endpoint.identification.algorithm", "https")
                .set("sasl.username", username)
                .set("sasl.password", password);
        }
        Authentication::Ssl { ca_location, certificate_location, key_location, key_password } => {
            config
                .set("security.protocol", "ssl")
                .set("ssl.ca.location", ca_location)
                .set("ssl.certificate.location", certificate_location)
                .set("ssl.key.location", key_location);

            if let Some(password) = key_password {
                config.set("ssl.key.password", password);
            }
        }
    }

    let client_config: StreamConsumer = config.create()?;
    Ok(client_config)
}