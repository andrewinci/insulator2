use std::{ops::Not, os::macos::raw, sync::Arc, time::Duration};

use crate::lib::{
    configuration::{build_kafka_client_config, ClusterConfig},
    consumer::types::{ConsumerOffsetConfiguration, ConsumerState},
    error::{Error, Result},
    record_store::{RawStore, TopicRecordStore},
    types::{ParsedKafkaRecord, RawKafkaRecord},
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
    async fn get_page(&self, page: usize) -> Vec<RawKafkaRecord>;
    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord>;
    async fn get_consumer_state(&self) -> ConsumerState;
}

pub struct KafkaConsumer {
    topic: String,
    consumer: Arc<Mutex<StreamConsumer>>,
    loop_handle: Arc<Mutex<Vec<JoinHandle<()>>>>,
    records: Arc<Mutex<Vec<RawKafkaRecord>>>,
    records_store: Arc<TopicRecordStore>,
}

impl KafkaConsumer {
    pub fn new(cluster_config: &ClusterConfig, topic: &str, raw_store: Arc<RawStore>) -> Self {
        let consumer: StreamConsumer = build_kafka_client_config(cluster_config, None)
            .create()
            .expect("Unable to create kafka the consumer");
        KafkaConsumer {
            consumer: Arc::new(Mutex::new(consumer)),
            topic: topic.to_string(),
            loop_handle: Arc::new(Mutex::new(vec![])),
            records: Arc::new(Mutex::new(Vec::new())),
            records_store: Arc::new(TopicRecordStore::new(raw_store, &cluster_config.id, topic)),
        }
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {
    async fn start(&self, offset_config: &ConsumerOffsetConfiguration) -> Result<()> {
        let topic = self.topic.clone();
        if self.loop_handle.lock().await.is_empty().not() {
            warn!("Try to start an already running consumer");
            return Err(Error::Consumer {
                message: format!("A consumer is already running for {}", topic),
            });
        }
        // setup the consumer to run from
        self.internal_setup_consumer(offset_config).await?;
        // clone arcs for the closure below
        let records = self.records.clone();
        let consumer = self.consumer.clone();
        let handle = self.loop_handle.clone();
        let store = self.records_store.clone();
        // set the handle to the consumer loop
        self.loop_handle
            .clone()
            .lock()
            .await
            .push(tauri::async_runtime::spawn(async move {
                {
                    // clear before starting the loop
                    records.lock().await.clear();
                }
                // infinite consumer loop
                debug!("Start consumer loop");
                loop {
                    match consumer.lock().await.stream().next().await {
                        Some(Ok(msg)) => {
                            trace!("New record from {}", topic);
                            records
                                .clone()
                                .lock()
                                .await
                                .push(KafkaConsumer::map_kafka_record(&msg.detach()));
                            store
                                .insert_record(&ParsedKafkaRecord {
                                    payload: Some("example payload".to_string()),
                                    key: Some("key".into()),
                                    topic: topic.clone().into(),
                                    timestamp: Some(321123321),
                                    partition: 2,
                                    offset: 123,
                                })
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
                        None => (),
                    }
                }
            }));
        Ok(())
    }

    async fn stop(&self) -> Result<()> {
        KafkaConsumer::_stop(self.loop_handle.clone()).await
    }

    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord> {
        self.records.clone().lock().await.get(index).cloned()
    }

    async fn get_page(&self, page: usize) -> Vec<RawKafkaRecord> {
        const PAGE_SIZE: usize = 100;
        self.records
            .clone()
            .lock()
            .await
            .iter()
            .skip(PAGE_SIZE * page)
            .take(PAGE_SIZE)
            .map(|r| r.to_owned())
            .collect()
    }

    async fn get_consumer_state(&self) -> ConsumerState {
        ConsumerState {
            is_running: self.loop_handle.clone().lock().await.is_empty().not(),
            record_count: self.records.lock().await.len(),
        }
    }
}

impl KafkaConsumer {
    async fn _stop(loop_handle: Arc<Mutex<Vec<JoinHandle<()>>>>) -> Result<()> {
        debug!("Consumer stopped");
        let mut handles = loop_handle.lock().await;
        if let Some(handle) = handles.get(0) {
            handle.abort();
            handles.clear();
        }
        Ok(())
    }

    fn map_kafka_record(msg: &OwnedMessage) -> RawKafkaRecord {
        RawKafkaRecord {
            payload: msg.payload().map(|v| v.to_owned()),
            key: msg.key().map(|v| v.to_owned()),
            topic: msg.topic().into(),
            partition: msg.partition(),
            offset: msg.offset(),
            timestamp: match msg.timestamp() {
                rdkafka::Timestamp::NotAvailable => None,
                rdkafka::Timestamp::CreateTime(t) => Some(t),
                rdkafka::Timestamp::LogAppendTime(t) => Some(t),
            },
        }
    }

    async fn internal_setup_consumer(&self, config: &ConsumerOffsetConfiguration) -> Result<()> {
        let consumer_ptr = self.consumer.clone();
        let consumer = &*consumer_ptr.lock().await;
        KafkaConsumer::setup_consumer(consumer, &[&self.topic], config).await
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
