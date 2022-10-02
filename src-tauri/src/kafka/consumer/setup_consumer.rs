use rdkafka::{ TopicPartitionList, consumer::{ Consumer, StreamConsumer } };
use serde::{ Serialize, Deserialize };

use super::{ create_consumer };
use crate::{ error::{ Result, TauriError }, configuration::Cluster, kafka::admin::{ list_topic_internal } };

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    pub cluster: Cluster,
    pub topic: String,
}

pub(super) fn setup_consumer(config: &ConsumerConfig) -> Result<StreamConsumer> {
    // build the kafka consumer
    let consumer = create_consumer(&config.cluster)?;
    let topic_info_lst = list_topic_internal(&config.cluster, Some(config.topic.as_str()))?;
    let topic_info = topic_info_lst.get(0).ok_or(TauriError {
        error_type: "Kafka consumer".into(),
        message: format!("Topic {} not found", config.topic),
    })?;
    let mut assignment = TopicPartitionList::new();

    // set the offset for each specified partition
    for p in topic_info.partitions.iter() {
        assignment.add_partition_offset(&config.topic, p.id, rdkafka::Offset::Offset(0))?;
    }
    consumer.assign(&assignment)?;
    Ok(consumer)
}