use std::sync::{Arc, Mutex};
use std::time::Duration;

use super::{ConsumerGroupAdmin, TopicAdmin};
use crate::lib::configuration::{build_kafka_client_config, ClusterConfig};
use crate::lib::error::Result;
use log::debug;
use rdkafka::admin::AdminClient;
use rdkafka::{client::DefaultClientContext, consumer::StreamConsumer};
use rdkafka::{Offset, TopicPartitionList};

pub trait Admin: TopicAdmin + ConsumerGroupAdmin {}

pub struct KafkaAdmin {
    pub(super) config: ClusterConfig,
    pub(super) timeout: Duration,
    pub(super) consumer: StreamConsumer,
    pub(super) admin_client: AdminClient<DefaultClientContext>,
    pub(super) all_topic_partition_list: Arc<Mutex<TopicPartitionList>>,
}

impl Admin for KafkaAdmin {}

impl KafkaAdmin {
    pub fn new(config: &ClusterConfig) -> Self {
        KafkaAdmin {
            config: config.clone(),
            timeout: Duration::from_secs(30),
            consumer: build_kafka_client_config(config, None)
                .create()
                .expect("Unable to create a consumer for the admin client."),
            admin_client: build_kafka_client_config(config, None)
                .create()
                .expect("Unable to build the admin client"),
            all_topic_partition_list: Arc::new(Mutex::new(TopicPartitionList::new())),
        }
    }

    pub(super) fn get_all_topic_partition_list(&self, ignore_cache: bool) -> Result<TopicPartitionList> {
        let mut topic_partition_list = self.all_topic_partition_list.lock().unwrap();
        if ignore_cache || topic_partition_list.count() == 0 {
            // clear before setting values
            *topic_partition_list = TopicPartitionList::new();
            debug!("Retrieve the list of all topics/partition");
            let topics = self.list_topics()?;
            debug!("Build the topic/partition list");
            topics.iter().for_each(|topic| {
                topic.partitions.iter().for_each(|partition| {
                    topic_partition_list
                        .add_partition_offset(&topic.name, partition.id, Offset::End)
                        .expect("Unable to add the partition offset");
                })
            });
        }
        Ok(topic_partition_list.clone())
    }
}
