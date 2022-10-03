use std::time::Duration;

use rdkafka::{ TopicPartitionList, consumer::{ Consumer, StreamConsumer }, Offset };
use serde::{ Serialize, Deserialize };

use super::{ create_consumer };
use crate::{ error::{ Result, TauriError }, configuration::Cluster, kafka::admin::{ list_topic_internal } };

#[derive(Serialize, Deserialize, Debug)]
pub enum ConsumeFrom {
    Beginning,
    End,
    Custom {
        start_timestamp: i64, //time in ms
        stop_timestamp: Option<i64>, //time in ms
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    pub cluster: Cluster,
    pub topic: String,
    pub from: ConsumeFrom,
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

    topic_info.partitions.iter().for_each(|p| {
        assignment.add_partition(&config.topic, p.id);
    });

    match config.from {
        ConsumeFrom::Beginning => {
            topic_info.partitions.iter().for_each(|p| {
                assignment
                    .set_partition_offset(&config.topic, p.id, Offset::Beginning)
                    .expect("Unable to configure the consumer to Beginning");
            });
        }
        ConsumeFrom::End =>
            topic_info.partitions.iter().for_each(|p| {
                assignment
                    .set_partition_offset(&config.topic, p.id, Offset::End)
                    .expect("Unable to configure the consumer to End");
            }),
        ConsumeFrom::Custom { start_timestamp, stop_timestamp: _ } => {
            // note: the offsets_for_times function takes a TopicPartitionList in which the
            // offset is the timestamp in ms (instead of the actual offset) and returns a
            // new TopicPartitionList with the actual offset
            let mut timestamp_assignment = TopicPartitionList::new();
            topic_info.partitions.iter().for_each(|p| {
                timestamp_assignment
                    .add_partition_offset(&config.topic, p.id, Offset::Offset(start_timestamp))
                    .expect("Unable to configure the consumer to End");
            });
            consumer
                .offsets_for_times(timestamp_assignment, Duration::from_secs(10))?
                .elements()
                .iter()
                .for_each(|tp| {
                    assignment
                        .set_partition_offset(tp.topic(), tp.partition(), tp.offset())
                        .expect("Unable to configure the consumer to starting offset");
                });
        }
    }
    consumer.assign(&assignment)?;
    Ok(consumer)
}