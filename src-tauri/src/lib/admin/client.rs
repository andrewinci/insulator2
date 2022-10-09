use async_trait::async_trait;
use std::time::Duration;

use rdkafka::consumer::Consumer;

use crate::kafka::error::Result;
use crate::{ configuration::Cluster, kafka::consumer::create_consumer };

#[async_trait]
pub trait Admin {}

pub struct KafkaAdmin {}

#[async_trait]
impl Admin for KafkaAdmin {}

impl KafkaAdmin {
    pub fn new() -> KafkaAdmin {
        KafkaAdmin {}
    }
}

use super::types::{ PartitionInfo, TopicInfo };

pub fn list_topics(cluster: &Cluster, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
    //todo: use cache
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