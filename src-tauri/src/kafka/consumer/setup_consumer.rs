use std::time::Duration;

use rdkafka::{ consumer::{ Consumer, StreamConsumer }, Offset, TopicPartitionList };

use super::{ create_consumer, types::{ ConsumeFrom, ConsumerConfig } };
use crate::{ kafka::{ admin::list_topics, error::{ Error, Result } } };

pub(super) fn setup_consumer(config: &ConsumerConfig) -> Result<StreamConsumer> {
    // build the kafka consumer
    let consumer = create_consumer(&config.cluster)?;
    let topic_info_lst = list_topics(&config.cluster, Some(config.topic.as_str()))?;
    let topic_info = topic_info_lst.get(0).ok_or(Error::GenericKafka {
        msg: format!("Topic {} not found", config.topic),
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