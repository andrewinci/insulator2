use std::time::Duration;
use rdkafka::consumer::Consumer;
use serde::{ Serialize, Deserialize };

use crate::configuration::{ Cluster };
use crate::error::Result;

use super::consumer::create_consumer;

#[derive(Serialize, Deserialize, Debug)]
pub struct PartitionInfo {
    pub id: i32,
    pub isr: usize,
    pub replicas: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TopicInfo {
    pub name: String,
    pub partitions: Vec<PartitionInfo>,
}

#[tauri::command]
pub async fn list_topic(cluster: Cluster, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
    list_topic_internal(&cluster, topic)
}

pub fn list_topic_internal(cluster: &Cluster, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
    let topics: Vec<TopicInfo> = create_consumer(cluster)?
        .fetch_metadata(topic, Duration::from_secs(30))?
        .topics()
        .iter()
        .map(|t| TopicInfo {
            name: t.name().to_string(),
            partitions: t
                .partitions()
                .iter()
                .map(|m| PartitionInfo {
                    id: m.id(),
                    isr: m.isr().len(),
                    replicas: m.replicas().len(),
                })
                .collect(),
        })
        .collect();
    Ok(topics)
}