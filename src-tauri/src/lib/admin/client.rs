use async_trait::async_trait;
use log::{ warn, debug };
use std::{ time::Duration, vec };

use super::types::{ PartitionInfo, TopicInfo };
use crate::lib::{ configuration::{ ClusterConfig, build_kafka_client_config }, error::{ Error, Result } };
use rdkafka::{
    consumer::{ Consumer, StreamConsumer },
    client::DefaultClientContext,
    admin::{ NewTopic, TopicReplication, AdminOptions },
};
use rdkafka::admin::AdminClient;

#[async_trait]
pub trait Admin {
    fn list_topics(&self) -> Result<Vec<TopicInfo>>;
    fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo>;
    async fn create_topic(&self, topic_name: &str, partitions: i32, isr: i32, compacted: bool) -> Result<()>;
}

pub struct KafkaAdmin {
    consumer: StreamConsumer,
    admin_client: AdminClient<DefaultClientContext>,
}

impl KafkaAdmin {
    pub fn new(config: &ClusterConfig) -> KafkaAdmin {
        KafkaAdmin {
            consumer: build_kafka_client_config(config)
                .create()
                .expect("Unable to create a consumer for the admin client."),
            admin_client: build_kafka_client_config(config).create().expect("Unable to build the admin client"),
        }
    }
}

#[async_trait]
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

    async fn create_topic(&self, name: &str, num_partitions: i32, isr: i32, compacted: bool) -> Result<()> {
        let new_topic = NewTopic {
            name,
            num_partitions,
            config: vec![("cleanup.policy", if compacted { "compact" } else { "delete" })],
            replication: TopicReplication::Fixed(isr),
        };
        let opts = AdminOptions::new();
        let res = self.admin_client.create_topics(vec![&new_topic], &opts).await?;
        let res = res.get(0).expect("Create topic: missing result");
        match res {
            Ok(_) => {
                debug!("Topic created successfully");
                Ok(())
            }
            Err(err) => {
                warn!("{:?}", err);
                Err(Error::Kafka { message: format!("Unable to create the topic. {} {}", err.0, err.1) })
            }
        }
    }
}

impl KafkaAdmin {
    pub fn list_topics(&self, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
        //todo: cache them
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