use log::warn;
use std::time::Duration;

use super::types::{ PartitionInfo, TopicInfo };
use crate::lib::{ configuration::ClusterConfig, consumer::create_consumer, error::{ Error, Result } };
use rdkafka::consumer::{ Consumer, StreamConsumer };

pub trait Admin {
    fn list_topics(&self) -> Result<Vec<TopicInfo>>;
    fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo>;
}

pub struct KafkaAdmin {
    consumer: StreamConsumer,
}

impl KafkaAdmin {
    pub fn new(cluster_config: &ClusterConfig) -> KafkaAdmin {
        KafkaAdmin {
            consumer: create_consumer(cluster_config).expect("Unable to create a consumer for the admin client."),
        }
    }
}

impl Admin for KafkaAdmin {
    fn list_topics(&self) -> Result<Vec<TopicInfo>> {
        self.list_topics(None)
    }

    fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo> {
        let info = self.list_topics(Some(topic_name))?;
        if info.len() == 1 {
            Ok(info.get(0).unwrap().clone())
        } else {
            warn!("Topic not found or more than one topic with the same name {}", topic_name);
            Err(Error::Kafka {
                message: "Topic not found".into(),
            })
        }
    }
}

impl KafkaAdmin {
    pub fn list_topics(&self, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
        //todo: use cache
        let topics: Vec<TopicInfo> = self.consumer
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
}