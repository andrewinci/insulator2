use std::time::Duration;
use rdkafka::{ consumer::{ Consumer, StreamConsumer }, ClientConfig };
use serde::{ Serialize, Deserialize };

use crate::configuration::Cluster;

fn create_consumer(cluster: &Cluster) -> Result<StreamConsumer, String> {
    // todo: cache
    let mut config = ClientConfig::new();
    config
        .set("enable.partition.eof", "true")
        .set("bootstrap.servers", &cluster.endpoint)
        .set("session.timeout.ms", "6000")
        .set("api.version.request", "true")
        .set("debug", "all");
    match &cluster.authentication {
        crate::configuration::Authentication::None => {
            config.set("security.protocol", "PLAINTEXT");
        }
        crate::configuration::Authentication::Sasl { username, password, scram } => {
            config
                .set("security.protocol", "SASL_SSL")
                .set("sasl.mechanisms", if *scram { "SCRAM-SHA-256" } else { "PLAIN" })
                .set("ssl.endpoint.identification.algorithm", "https")
                .set("sasl.username", username)
                .set("sasl.password", password);
        }

        crate::configuration::Authentication::Ssl {
            ca_location,
            certificate_location,
            key_location,
            key_password,
        } => {
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
    config.create().map_err(|err| format!("Unable to build the Kafka consumer. {}", err))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TopicInfo {
    name: String,
}

#[tauri::command]
pub async fn list_topics(cluster: Cluster) -> Result<Vec<TopicInfo>, String> {
    let consumer = create_consumer(&cluster)?;
    let metadata = consumer
        .fetch_metadata(None, Duration::from_secs(10))
        .map_err(|err| format!("Kafka error. {}", err))?;

    let topic_info: Vec<TopicInfo> = metadata
        .topics()
        .iter()
        .map(|t| TopicInfo {
            name: t.name().to_string(),
        })
        .collect();
    Ok(topic_info)
}