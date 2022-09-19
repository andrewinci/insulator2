use std::time::Duration;
use rdkafka::{ consumer::{ Consumer, StreamConsumer }, ClientConfig };
use serde::{ Serialize, Deserialize };

use crate::configuration::Cluster;

fn create_consumer(cluster: &Cluster) -> Result<StreamConsumer, String> {
    // todo: cache
    ClientConfig::new()
        .set("enable.partition.eof", "true")
        .set("bootstrap.servers", &cluster.endpoint)
        .set("session.timeout.ms", "6000")
        .set("api.version.request", "true")
        .set("debug", "all")
        .create()
        .map_err(|err| format!("Unable to build the Kafka consumer. {}", err))
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