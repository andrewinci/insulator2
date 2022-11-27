use std::{sync::Arc, time::Duration};

use crate::lib::{
    configuration::{build_kafka_client_config, ClusterConfig},
    consumer::types::{ConsumerOffsetConfiguration, ConsumerState},
    error::{Error, Result},
    record_store::TopicStore,
    types::RawKafkaRecord,
};
use async_trait::async_trait;
use futures::{lock::Mutex, StreamExt};
use log::{debug, error, trace, warn};
use rdkafka::{
    consumer::{Consumer as ApacheKafkaConsumer, StreamConsumer},
    message::OwnedMessage,
    Message, Offset, TopicPartitionList,
};
use tauri::async_runtime::JoinHandle;

#[async_trait]
pub trait Consumer {
    async fn start(&self, offset_config: &ConsumerOffsetConfiguration) -> Result<()>;
    async fn stop(&self) -> Result<()>;
    async fn get_consumer_state(&self) -> Result<ConsumerState>;
}

pub struct KafkaConsumer {
    cluster_config: ClusterConfig,
    topic: String,
    loop_handle: Arc<Mutex<Option<JoinHandle<()>>>>,
    pub topic_store: Arc<TopicStore>,
}

impl KafkaConsumer {
    pub fn new(cluster_config: &ClusterConfig, topic: &str, topic_store: TopicStore) -> Self {
        KafkaConsumer {
            cluster_config: cluster_config.clone(),
            topic: topic.to_string(),
            loop_handle: Arc::new(Mutex::new(None)),
            topic_store: Arc::new(topic_store),
        }
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {
    async fn start(&self, offset_config: &ConsumerOffsetConfiguration) -> Result<()> {
        let topic = self.topic.clone();
        if self.loop_handle.lock().await.is_some() {
            warn!("Try to start an already running consumer");
            return Err(Error::Consumer {
                message: format!("A consumer is already running for {}", topic),
            });
        }
        // set the handle to the consumer loop
        *self.loop_handle.clone().lock().await = Some(tauri::async_runtime::spawn({
            // clone arcs for the closure below
            let consumer: StreamConsumer = build_kafka_client_config(&self.cluster_config, None)
                .create()
                .expect("Unable to create kafka the consumer");

            let handle = self.loop_handle.clone();
            let topic_store = self.topic_store.clone();
            let offset_config = offset_config.clone();

            async move {
                let topics: &[&str] = &[&topic];
                let setup_consumer_res = KafkaConsumer::setup_consumer(&consumer, topics, &offset_config);
                // clear the store before starting the loop
                topic_store.clear().expect("Unable to clear the table");
                // wait the consumer to be configure before starting to consume
                setup_consumer_res.await.expect("Unable to setup the consumer");

                // infinite consumer loop
                debug!("Start consumer loop");
                loop {
                    match consumer.stream().next().await {
                        Some(Ok(msg)) => {
                            trace!("New record from {}", topic);
                            topic_store
                                .insert_record(&KafkaConsumer::map_kafka_record(&msg.detach()))
                                .await
                                .expect("Unable to insert the new record in store");
                        }
                        Some(Err(err)) => {
                            error!("An error occurs consuming from kafka: {}", err);
                            //todo: self.notify_error("Consumer error", &err.to_string());
                            KafkaConsumer::_stop(handle.clone())
                                .await
                                .expect("Unable to stop the consumer");
                            break;
                        }
                        None => {
                            error!("Consumer unexpectedly returned no messages");
                            break;
                        }
                    }
                }
            }
        }));
        Ok(())
    }

    async fn stop(&self) -> Result<()> {
        KafkaConsumer::_stop(self.loop_handle.clone()).await
    }

    async fn get_consumer_state(&self) -> Result<ConsumerState> {
        Ok(ConsumerState {
            is_running: self.loop_handle.clone().lock().await.is_some(),
            record_count: self.topic_store.get_size(None)?, //total records in the topic
        })
    }
}

impl KafkaConsumer {
    async fn _stop(loop_handle: Arc<Mutex<Option<JoinHandle<()>>>>) -> Result<()> {
        debug!("Consumer stopped");
        if let Some(handle) = &*loop_handle.lock().await {
            handle.abort();
        }
        *loop_handle.lock().await = None;
        Ok(())
    }

    fn map_kafka_record(msg: &OwnedMessage) -> RawKafkaRecord {
        RawKafkaRecord {
            payload: msg.payload().map(|v| v.to_owned()),
            key: msg.key().map(|v| v.to_owned()),
            topic: msg.topic().into(),
            partition: msg.partition(),
            offset: msg.offset(),
            timestamp: msg.timestamp().to_millis().map(|v| v as u64),
        }
    }

    pub async fn setup_consumer(
        consumer: &rdkafka::consumer::StreamConsumer,
        topics: &[&str],
        config: &ConsumerOffsetConfiguration,
    ) -> Result<()> {
        let tmo = Duration::from_secs(60);
        let metadata = consumer.fetch_metadata(None, tmo)?;
        let topic_partition: Vec<_> = metadata
            .topics()
            .iter()
            .filter(|t| topics.contains(&t.name()))
            .flat_map(|t| t.partitions().iter().map(|p| (t.name(), p.id())))
            .collect();

        match config {
            ConsumerOffsetConfiguration::Beginning => {
                let mut timestamp_assignment = TopicPartitionList::new();
                topic_partition.iter().for_each(|(t, p)| {
                    timestamp_assignment
                        .add_partition_offset(t, *p, Offset::Beginning)
                        .expect("Unable to configure the consumer to the beginning");
                });
                trace!("Assign partitions {:?}", timestamp_assignment);
                consumer.assign(&consumer.offsets_for_times(timestamp_assignment, tmo)?)?;
            }
            ConsumerOffsetConfiguration::End => {
                let mut timestamp_assignment = TopicPartitionList::new();
                topic_partition.iter().for_each(|(t, p)| {
                    timestamp_assignment
                        .add_partition_offset(t, *p, Offset::End)
                        .expect("Unable to configure the consumer to the end");
                });
                trace!("Assign partitions {:?}", timestamp_assignment);
                consumer.assign(&consumer.offsets_for_times(timestamp_assignment, tmo)?)?;
            }
            ConsumerOffsetConfiguration::Custom {
                start_timestamp,
                stop_timestamp: _,
            } => {
                // note: the offsets_for_times function takes a TopicPartitionList in which the
                // offset is the timestamp in ms (instead of the actual offset) and returns a
                // new TopicPartitionList with the actual offset
                let mut timestamp_assignment = TopicPartitionList::new();
                topic_partition.iter().for_each(|(t, p)| {
                    timestamp_assignment
                        .add_partition_offset(t, *p, Offset::Offset(*start_timestamp))
                        .expect("Unable to configure the consumer to timestamp");
                });
                trace!("Assign partitions {:?}", timestamp_assignment);
                consumer.assign(&consumer.offsets_for_times(timestamp_assignment, tmo)?)?;
            }
        }
        Ok(())
    }
}
