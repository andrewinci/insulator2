use std::sync::Arc;
use std::time::Duration;

use crate::lib::configuration::{build_kafka_client_config, ClusterConfig};
use crate::lib::error::LibResult;
use log::debug;
use rdkafka::admin::AdminClient;
use rdkafka::{client::DefaultClientContext, consumer::BaseConsumer};
use rdkafka::{Offset, TopicPartitionList};
use tokio::sync::RwLock;

pub struct KafkaAdmin {
    pub(super) config: ClusterConfig,
    pub(super) timeout: Duration,
    pub(super) consumer: BaseConsumer,
    pub(super) admin_client: AdminClient<DefaultClientContext>,
    pub(super) all_topic_partition_list: Arc<RwLock<TopicPartitionList>>,
}

impl KafkaAdmin {
    pub fn new(config: &ClusterConfig, kafka_timeout: Duration) -> LibResult<Self> {
        Ok(KafkaAdmin {
            config: config.clone(),
            timeout: kafka_timeout,
            consumer: build_kafka_client_config(config, None).create()?,
            admin_client: build_kafka_client_config(config, None).create()?,
            all_topic_partition_list: Arc::new(RwLock::new(TopicPartitionList::new())),
        })
    }

    pub(super) async fn get_all_topic_partition_list(&self, ignore_cache: bool) -> LibResult<TopicPartitionList> {
        {
            let topic_partition_list = self.all_topic_partition_list.read().await;
            if !ignore_cache && topic_partition_list.count() > 0 {
                return Ok(topic_partition_list.clone());
            }
        }
        let mut topic_partition_list = TopicPartitionList::new();
        debug!("Retrieve the list of all topics/partition");
        let topics = self.list_topics().await?;
        debug!("Build the topic/partition list");
        for topic in topics {
            for partition in topic.partitions {
                topic_partition_list.add_partition_offset(&topic.name, partition.id, Offset::End)?;
            }
        }
        {
            *self.all_topic_partition_list.write().await = topic_partition_list.clone();
        }
        Ok(topic_partition_list)
    }
}
