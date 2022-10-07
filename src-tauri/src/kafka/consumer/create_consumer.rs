use rdkafka::{ consumer::StreamConsumer, ClientConfig };

use crate::{ configuration::{ Authentication, Cluster }, kafka::error::Result };

pub fn create_consumer(cluster: &Cluster) -> Result<StreamConsumer> {
    // todo: memoize
    let mut config = ClientConfig::new();
    config
        .set("enable.partition.eof", "true")
        .set("bootstrap.servers", &cluster.endpoint)
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "false")
        .set("group.id", "insulator-2")
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

        Authentication::Ssl { ca, certificate, key, key_password } => {
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
    let client_config: StreamConsumer = config.create()?;
    Ok(client_config)
}