use crate::lib::{
    configuration::{build_kafka_client_config, ClusterConfig},
    consumer::types::{ConsumerConfiguration, ConsumerSessionConfiguration, ConsumerState},
    error::{Error, Result},
    record_store::TopicStore,
    types::{ErrorCallback, RawKafkaRecord},
};
use async_trait::async_trait;
use futures::{lock::Mutex, StreamExt};
use log::{debug, error, warn};
use rdkafka::{
    consumer::{Consumer as ApacheKafkaConsumer, StreamConsumer},
    message::OwnedMessage,
    Message, Offset, TopicPartitionList,
};
use std::{sync::Arc, time::Duration};
use tauri::async_runtime::JoinHandle;

#[async_trait]
pub trait Consumer {
    async fn start(&self, offset_config: &ConsumerConfiguration) -> Result<()>;
    async fn stop(&self) -> Result<()>;
    async fn get_consumer_state(&self) -> Result<ConsumerState>;
}

pub struct KafkaConsumer {
    cluster_config: ClusterConfig,
    topic: String,
    loop_handle: Arc<Mutex<Option<JoinHandle<()>>>>,
    error_callback: ErrorCallback,
    pub topic_store: Arc<TopicStore>,
    timeout: Duration,
}

impl KafkaConsumer {
    pub fn new(
        cluster_config: &ClusterConfig,
        topic: &str,
        topic_store: TopicStore,
        error_cb: ErrorCallback,
        timeout: Duration,
    ) -> Self {
        KafkaConsumer {
            error_callback: error_cb,
            cluster_config: cluster_config.clone(),
            topic: topic.to_string(),
            loop_handle: Arc::new(Mutex::new(None)),
            topic_store: Arc::new(topic_store),
            timeout,
        }
    }

    pub fn update_consumer_assignment(
        consumer: &rdkafka::consumer::StreamConsumer,
        topics: &[&str],
        config: &ConsumerSessionConfiguration,
        tmo: Duration,
    ) -> Result<()> {
        let metadata = consumer.fetch_metadata(if topics.len() == 1 { Some(topics[0]) } else { None }, tmo)?;
        let topic_partition: Vec<_> = metadata
            .topics()
            .iter()
            .filter(|t| topics.contains(&t.name()))
            .flat_map(|t| t.partitions().iter().map(|p| (t.name(), p.id())))
            .collect();

        let mut timestamp_assignment = consumer.assignment()?;
        match config {
            ConsumerSessionConfiguration::Beginning => {
                for (t, p) in topic_partition {
                    timestamp_assignment.add_partition_offset(t, p, Offset::Beginning)?;
                }
            }
            ConsumerSessionConfiguration::End => {
                for (t, p) in topic_partition {
                    timestamp_assignment.add_partition_offset(t, p, Offset::End)?;
                }
            }
            ConsumerSessionConfiguration::Custom {
                start_timestamp,
                stop_timestamp: _,
            } => {
                // note: the offsets_for_times function takes a TopicPartitionList in which the
                // offset is the timestamp in ms (instead of the actual offset) and returns a
                // new TopicPartitionList with the actual offset
                for (t, p) in topic_partition {
                    timestamp_assignment.add_partition_offset(t, p, Offset::Offset(*start_timestamp))?;
                }
            }
        }
        let assignment = consumer.offsets_for_times(timestamp_assignment, tmo)?;
        consumer.assign(&assignment)?;
        debug!("Partition assigned {:?}", assignment);
        Ok(())
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {
    async fn start(&self, consumer_config: &ConsumerConfiguration) -> Result<()> {
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

            // configure the consumer
            if let Err(err) = KafkaConsumer::update_consumer_assignment(
                &consumer,
                &[&topic],
                &consumer_config.consumer_start_config,
                self.timeout,
            ) {
                error!("{:?}", err);
                (self.error_callback)(err);
                panic!("Unable to continue");
            }

            let loop_handle = self.loop_handle.clone();
            let topic_store = self.topic_store.clone();
            let consumer_config = consumer_config.clone();
            let error_callback = self.error_callback.clone();
            async move { consumer_loop(&consumer, &consumer_config, &topic_store, &error_callback, loop_handle).await }
        }));
        Ok(())
    }

    async fn stop(&self) -> Result<()> {
        _stop(self.loop_handle.clone()).await
    }

    async fn get_consumer_state(&self) -> Result<ConsumerState> {
        Ok(ConsumerState {
            is_running: self.loop_handle.clone().lock().await.is_some(),
            record_count: self.topic_store.get_records_count()?,
        })
    }
}

fn get_stop_timestamp(consumer_config: &ConsumerConfiguration) -> Option<u64> {
    // retrieve the stop timestamp if specified
    if let ConsumerSessionConfiguration::Custom {
        stop_timestamp: Some(stop),
        ..
    } = &consumer_config.consumer_start_config
    {
        Some(*stop as u64)
    } else {
        None
    }
}

async fn consumer_loop(
    consumer: &StreamConsumer,
    consumer_config: &ConsumerConfiguration,
    topic_store: &TopicStore,
    error_callback: &ErrorCallback,
    loop_handle: Arc<Mutex<Option<JoinHandle<()>>>>,
) {
    let stop_timestamp = get_stop_timestamp(consumer_config);

    // setup a new store
    topic_store
        .setup(consumer_config.compactify)
        .expect("Unable to create the internal store");

    // infinite consumer loop
    debug!("Start consumer loop");
    loop {
        match consumer.stream().next().await {
            Some(Ok(msg)) => {
                handle_consumed_message(&msg.detach(), topic_store, stop_timestamp, consumer, error_callback).await;
            }
            Some(Err(err)) => {
                error!("An error occurs consuming from kafka: {}", err);
                error_callback(Error::Consumer {
                    message: err.to_string(),
                });
                _stop(loop_handle.clone()).await.expect("Unable to stop the consumer");
                break;
            }
            None => {
                error!("Consumer unexpectedly returned no messages");
                break;
            }
        }
    }
}

async fn handle_consumed_message(
    msg: &OwnedMessage,
    topic_store: &TopicStore,
    stop_timestamp: Option<u64>,
    consumer: &StreamConsumer,
    error_callback: &ErrorCallback,
) {
    let record = map_kafka_record(msg);
    if record.timestamp.unwrap_or(u64::MIN) < stop_timestamp.unwrap_or(u64::MAX) {
        topic_store
            .insert_record(&record)
            .await
            .unwrap_or_else(|err| error_callback(err));
    } else {
        // pause consumption on the record partition
        let mut tpl = TopicPartitionList::new();
        tpl.add_partition(&record.topic, record.partition);
        match consumer.pause(&tpl) {
            Ok(_) => {
                debug!("Pause consuming {} partition {}", record.topic, record.partition);
            }
            Err(err) => error!(
                "Unable to pause consuming {} partition {}: {:?}",
                record.topic, record.partition, err
            ),
        }
    }
}

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
