use log::{debug, trace};

use super::{ConsumerGroupInfo, KafkaAdmin};
use crate::lib::{
    admin::TopicPartitionOffset,
    configuration::build_kafka_client_config,
    consumer::{types::ConsumerSessionConfiguration, KafkaConsumer},
    error::LibResult,
    LibError,
};
use rdkafka::{
    admin::AdminOptions,
    consumer::{BaseConsumer, Consumer},
};
use rdkafka::{consumer::CommitMode, Offset};

impl KafkaAdmin {
    pub async fn delete_consumer_group(&self, consumer_group_name: &str) -> LibResult<()> {
        debug!("Deleting consumer group {}", consumer_group_name);
        let res = self
            .admin_client
            .delete_groups(&[consumer_group_name], &AdminOptions::default())
            .await?;
        assert_eq!(res.len(), 1);
        match res.first().unwrap() {
            Ok(_) => Ok(()),
            Err(err) => Err(LibError::Kafka {
                message: format!("Unable to delete the group {}. Error {}", err.0, err.1),
            }),
        }
    }

    pub async fn set_consumer_group(
        &self,
        consumer_group_name: &str,
        topic_names: &[&str],
        config: &ConsumerSessionConfiguration,
    ) -> LibResult<()> {
        let consumer = build_kafka_client_config(&self.config, Some(consumer_group_name)).create()?;

        debug!("assign offsets for each topic");
        KafkaConsumer::update_consumer_assignment(&consumer, topic_names, config, self.timeout)?;

        debug!("store offset to commit");
        for t in consumer.assignment()?.elements() {
            trace!(
                "Store topic {:?} partition {:?} offset {:?}",
                t.topic(),
                t.partition(),
                t.offset().to_raw()
            );
            consumer.store_offset(t.topic(), t.partition(), t.offset().to_raw().unwrap() - 1)?;
        }

        debug!("commit consumer state");
        Ok(consumer.commit_consumer_state(CommitMode::Sync)?)
    }

    pub fn list_consumer_groups(&self) -> LibResult<Vec<String>> {
        let groups = self.consumer.fetch_group_list(None, self.timeout)?;
        let group_names: Vec<_> = groups.groups().iter().map(|g| g.name().to_string()).collect();
        Ok(group_names)
    }

    pub async fn describe_consumer_group(
        &self,
        consumer_group_name: &str,
        ignore_cache: bool,
    ) -> LibResult<ConsumerGroupInfo> {
        // create a consumer with the defined consumer_group_name.
        // NOTE: the consumer shouldn't join the consumer group, otherwise it'll cause a re-balance
        debug!("Build the consumer for the consumer group {}", consumer_group_name);
        let consumer: BaseConsumer = build_kafka_client_config(&self.config, Some(consumer_group_name)).create()?;

        debug!("Build the topic/partition list");
        let topic_partition_lst = self.get_all_topic_partition_list(ignore_cache).await?;

        debug!("Retrieve any committed offset to the consumer group");
        // allow up to 1 minute of tmo for big clusters and slow connections
        let committed_offsets = consumer.committed_offsets(topic_partition_lst, self.timeout).unwrap();

        debug!("Build API response");
        let offsets: Vec<_> = committed_offsets
            .elements()
            .iter()
            .filter(|tpo| tpo.offset() != Offset::Invalid)
            .map(|r| TopicPartitionOffset {
                topic: r.topic().into(),
                partition_id: r.partition(),
                offset: r.offset().to_raw().unwrap(),
            })
            .collect();
        debug!("Retrieve completed");
        Ok(ConsumerGroupInfo {
            name: consumer_group_name.into(),
            offsets,
        })
    }

    pub fn get_consumer_group_state(&self, consumer_group_name: &str) -> LibResult<String> {
        debug!("Retrieve consumer group status");
        let fetch_group_response = self
            .consumer
            .fetch_group_list(Some(consumer_group_name), self.timeout)?;
        let groups: Vec<_> = fetch_group_response.groups().iter().collect();
        assert_eq!(groups.len(), 1);
        Ok(groups[0].state().to_string())
    }
}
