use std::{ sync::Arc, time::Duration, ops::Not };

use async_trait::async_trait;
use futures::{ lock::Mutex, StreamExt };
use log::{ warn, debug, trace };
use rdkafka::{
    consumer::{ StreamConsumer, Consumer as ApacheKafkaConsumer },
    Offset,
    TopicPartitionList,
    Message,
    message::OwnedMessage,
};
use tauri::async_runtime::JoinHandle;
use crate::lib::{
    error::{ Result, Error },
    consumer::types::{ ConsumerOffsetConfiguration, ConsumerState },
    types::RawKafkaRecord,
    consumer::create_consumer,
    configuration::ClusterConfig,
    admin::Admin,
};

#[async_trait]
pub trait Consumer {
    async fn start(&self, offset_config: ConsumerOffsetConfiguration) -> Result<()>;
    async fn stop(&self) -> Result<()>;
    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord>;
    async fn get_consumer_state(&self) -> ConsumerState;
}

pub struct KafkaConsumer {
    topic: String,
    consumer: Arc<Mutex<StreamConsumer>>,
    loop_handle: Arc<Mutex<Vec<JoinHandle<()>>>>,
    records: Arc<Mutex<Vec<RawKafkaRecord>>>,
    admin_client: Arc<dyn Admin + Send + Sync + 'static>,
}

impl KafkaConsumer {
    pub fn new(
        cluster_config: &ClusterConfig,
        topic: String,
        admin_client: Arc<dyn Admin + Send + Sync + 'static>
    ) -> KafkaConsumer {
        KafkaConsumer {
            consumer: Arc::new(
                Mutex::new(create_consumer(cluster_config).expect("Unable to create kafka the consumer"))
            ),
            topic,
            loop_handle: Arc::new(Mutex::new(vec![])),
            records: Arc::new(Mutex::new(Vec::new())),
            admin_client,
        }
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {
    async fn start(&self, offset_config: ConsumerOffsetConfiguration) -> Result<()> {
        let topic = self.topic.clone();
        if self.loop_handle.lock().await.is_empty().not() {
            warn!("Try to start an already running consumer");
            return Err(Error::Consumer { message: format!("A consumer is already running for {}", topic) });
        }
        // setup the consumer to run from
        self.setup_consumer(&offset_config).await?;
        // clone arcs for the closure below
        let records = self.records.clone();
        let consumer = self.consumer.clone();
        // set the handle to the consumer loop
        self.loop_handle
            .clone()
            .lock().await
            .push(
                tauri::async_runtime::spawn(async move {
                    // clear before starting the loop
                    records.lock().await.clear();
                    // infinite consumer loop
                    debug!("Start consumer loop");
                    loop {
                        match consumer.lock().await.stream().next().await {
                            Some(Ok(msg)) => {
                                trace!("New record from {}", topic);
                                records.clone().lock().await.push(KafkaConsumer::map_kafka_record(&msg.detach()));
                            }
                            Some(Err(_err)) => {
                                //todo: filter out end of partition
                                //self.notify_error("Consumer error", &err.to_string());
                            }
                            None => (),
                        }
                    }
                })
            );
        Ok(())
    }

    async fn stop(&self) -> Result<()> {
        debug!("Consumer stopped");
        let h = self.loop_handle.clone();
        let mut handles = h.lock().await;
        if let Some(handle) = handles.get(0) {
            handle.abort();
            handles.clear();
        }
        Ok(())
    }

    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord> {
        self.records.clone().lock().await.get(index).cloned()
    }

    async fn get_consumer_state(&self) -> ConsumerState {
        ConsumerState {
            is_running: self.loop_handle.clone().lock().await.is_empty().not(),
            record_count: self.records.lock().await.len(),
        }
    }
}

impl KafkaConsumer {
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

    async fn setup_consumer(&self, config: &ConsumerOffsetConfiguration) -> Result<()> {
        let topic_name = self.topic.clone();
        let topic_info = self.admin_client.get_topic_info(&topic_name)?;

        let mut assignment = TopicPartitionList::new();

        topic_info.partitions.iter().for_each(|p| {
            assignment.add_partition(&topic_name, p.id);
        });

        match config {
            ConsumerOffsetConfiguration::Beginning => {
                topic_info.partitions.iter().for_each(|p| {
                    assignment
                        .set_partition_offset(&topic_name, p.id, Offset::Beginning)
                        .expect("Unable to configure the consumer to Beginning");
                });
            }
            ConsumerOffsetConfiguration::End =>
                topic_info.partitions.iter().for_each(|p| {
                    assignment
                        .set_partition_offset(&topic_name, p.id, Offset::End)
                        .expect("Unable to configure the consumer to End");
                }),
            ConsumerOffsetConfiguration::Custom { start_timestamp, stop_timestamp: _ } => {
                // note: the offsets_for_times function takes a TopicPartitionList in which the
                // offset is the timestamp in ms (instead of the actual offset) and returns a
                // new TopicPartitionList with the actual offset
                let mut timestamp_assignment = TopicPartitionList::new();
                topic_info.partitions.iter().for_each(|p| {
                    timestamp_assignment
                        .add_partition_offset(&topic_name, p.id, Offset::Offset(*start_timestamp))
                        .expect("Unable to configure the consumer to End");
                });
                self.consumer
                    .lock().await
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
        self.consumer.lock().await.assign(&assignment)?;
        Ok(())
    }
}