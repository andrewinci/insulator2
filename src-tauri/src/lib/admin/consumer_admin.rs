use async_trait::async_trait;
use log::{debug, trace};
use std::time::Duration;

use super::{ConsumerGroupInfo, KafkaAdmin};
use crate::lib::{
    admin::TopicPartitionOffset,
    configuration::build_kafka_client_config,
    consumer::{ConsumerOffsetConfiguration, KafkaConsumer},
    error::Result,
};
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::{consumer::CommitMode, Offset, TopicPartitionList};

#[async_trait]
pub trait ConsumerGroupAdmin {
    async fn set_consumer_group(
        &self,
        consumer_group_name: &str,
        topics: &[&str],
        config: &ConsumerOffsetConfiguration,
    ) -> Result<()>;
    fn list_consumer_groups(&self) -> Result<Vec<String>>;
    fn describe_consumer_group(&self, consumer_group_name: &str, ignore_cache: bool) -> Result<ConsumerGroupInfo>;
    fn get_consumer_group_state(&self, consumer_group_name: &str) -> Result<String>;
}

#[async_trait]
impl ConsumerGroupAdmin for KafkaAdmin {
    async fn set_consumer_group(
        &self,
        consumer_group_name: &str,
        topic_names: &[&str],
        config: &ConsumerOffsetConfiguration,
    ) -> Result<()> {
        let consumer: StreamConsumer = build_kafka_client_config(&self.config, Some(consumer_group_name))
            .create()
            .expect("Unable to build the consumer");

        // assign offsets
        KafkaConsumer::setup_consumer(&consumer, topic_names, config).await?;

        // store offset to commit
        consumer.assignment()?.elements().iter().for_each(|t| {
            trace!(
                "Store topic {:?} partition {:?} offset {:?}",
                t.topic(),
                t.partition(),
                t.offset().to_raw()
            );
            consumer
                .store_offset(t.topic(), t.partition(), t.offset().to_raw().unwrap() - 1)
                .expect("Unable to store the offset into the consumer group");
        });

        Ok(consumer.commit_consumer_state(CommitMode::Sync)?)
    }

    fn list_consumer_groups(&self) -> Result<Vec<String>> {
        let groups = self.consumer.fetch_group_list(None, self.timeout)?;
        let group_names: Vec<_> = groups.groups().iter().map(|g| g.name().to_string()).collect();
        Ok(group_names)
    }

    fn describe_consumer_group(&self, consumer_group_name: &str, ignore_cache: bool) -> Result<ConsumerGroupInfo> {
        // create a consumer with the defined consumer_group_name.
        // NOTE: the consumer shouldn't join the consumer group, otherwise it'll cause a re-balance
        debug!("Build the consumer for the consumer group {}", consumer_group_name);
        let consumer: StreamConsumer = build_kafka_client_config(&self.config, Some(consumer_group_name))
            .create()
            .expect("Unable to build the consumer");

        debug!("Build the topic/partition list");
        let topic_partition_lst = self.get_all_topic_partition_list(ignore_cache)?;

        debug!("Retrieve any committed offset to the consumer group");
        // allow up to 1 minute of tmo for big clusters and slow connections
        let committed_offsets = consumer
            .committed_offsets(topic_partition_lst, Duration::from_secs(60))
            .unwrap();

        debug!("Retrieve last offset to compute the lag");
        let last_offset = self.get_last_offset(committed_offsets.clone())?;

        debug!("Build API response");
        let offsets: Vec<_> = committed_offsets
            .elements()
            .iter()
            .filter(|tpo| tpo.offset() != Offset::Invalid)
            .map(|r| TopicPartitionOffset {
                topic: r.topic().into(),
                partition_id: r.partition(),
                offset: r.offset().to_raw().unwrap(),
                last_offset: last_offset
                    .find_partition(r.topic(), r.partition())
                    .unwrap()
                    .offset()
                    .to_raw()
                    .unwrap(),
            })
            .collect();
        debug!("Retrieve completed");

        Ok(ConsumerGroupInfo {
            name: consumer_group_name.into(),
            offsets,
        })
    }

    fn get_consumer_group_state(&self, consumer_group_name: &str) -> Result<String> {
        debug!("Retrieve consumer group status");
        let fetch_group_response = self
            .consumer
            .fetch_group_list(Some(consumer_group_name), self.timeout)?;
        let groups: Vec<_> = fetch_group_response.groups().iter().collect();
        assert_eq!(groups.len(), 1);
        Ok(groups[0].state().to_string())
    }
}

impl KafkaAdmin {
    fn get_last_offset(&self, mut lst: TopicPartitionList) -> Result<TopicPartitionList> {
        lst.set_all_offsets(Offset::End)?;
        Ok(self.consumer.offsets_for_times(lst, Duration::from_secs(60))?)
    }
}
