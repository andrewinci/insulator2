use super::{
    parser::RecordParser,
    setup_consumer::setup_consumer,
    types::{ ConsumeFrom, ConsumerConfig, KafkaRecord, ConsumerState },
};
use crate::kafka::error::Result;
use futures::{ StreamExt, FutureExt, future::BoxFuture };
use log::{ debug, trace };
use rdkafka::{ consumer::StreamConsumer, message::OwnedMessage };
use std::sync::{ Arc };
use futures::lock::Mutex;

use tauri::async_runtime::JoinHandle;

pub trait GenericConsumer {
    fn start(&self) -> BoxFuture<Result<()>>;
    fn stop(&self) -> BoxFuture<()>;
    fn get_state(&self) -> BoxFuture<ConsumerState>;
    fn get_record(&self, index: usize) -> BoxFuture<Option<KafkaRecord>>;
}

#[derive(Clone)]
pub struct Consumer {
    config: ConsumerConfig,
    loop_handle: Arc<Mutex<Vec<JoinHandle<()>>>>, //todo: something better than Vec (Option doesn't work)
    error_notifier: Option<fn(&str, &str) -> ()>,
    consumed_records: Arc<Mutex<Vec<KafkaRecord>>>,
    parser: Arc<Box<dyn RecordParser + Send + Sync>>,
}

impl Consumer {
    pub fn new(
        config: &ConsumerConfig,
        parser: Box<dyn RecordParser + Send + Sync>,
        error_notifier: Option<fn(&str, &str) -> ()>
    ) -> Consumer {
        Consumer {
            config: config.clone(),
            loop_handle: Arc::new(Mutex::new(Vec::new())),
            error_notifier,
            consumed_records: Arc::new(Mutex::new(Vec::new())),
            parser: Arc::new(parser),
        }
    }
}

impl GenericConsumer for Consumer {
    fn start(&self) -> BoxFuture<Result<()>> {
        (
            async move {
                let handles = &self.loop_handle.clone();
                let mut state = handles.lock().await;
                let handle = state.get(0);
                if handle.is_some() {
                    debug!("The consumer for {} is already running. Ignore start", self.config.topic);
                    return Ok(());
                }

                let consumer = setup_consumer(&self.config)?;
                let current = self.clone();
                state.push(
                    tauri::async_runtime::spawn(async move {
                        current.consumer_loop(consumer).await;
                    })
                );
                Ok(())
            }
        ).boxed()
    }

    fn get_state(&self) -> BoxFuture<ConsumerState> {
        (
            async move {
                ConsumerState {
                    is_running: self.loop_handle.clone().lock().await.len() > 0,
                    record_count: self.consumed_records.clone().lock().await.len(),
                }
            }
        ).boxed()
    }

    fn stop(&self) -> BoxFuture<()> {
        (
            async move {
                debug!("Stopping consumer");
                let handles = &self.loop_handle.clone();
                let mut state = handles.lock().await;
                if let Some(handle) = state.get(0) {
                    // todo: something better than abort to stop the loop
                    handle.abort();
                    debug!("Removing handle to the running consumer loop");
                    state.clear();
                } else {
                    debug!("Nothing to stop");
                }
            }
        ).boxed()
    }

    fn get_record(&self, index: usize) -> BoxFuture<Option<KafkaRecord>> {
        (
            async move {
                trace!("Getting record {:?}", index);
                let records_mutex = &self.consumed_records.clone();
                let records = records_mutex.lock().await;
                records.get(index).cloned()
            }
        ).boxed()
    }
}

impl Consumer {
    fn notify_error(&self, error_type: &str, message: &str) {
        if let Some(f) = self.error_notifier {
            f(error_type, message);
        }
    }

    async fn consumer_loop(&self, consumer: StreamConsumer) {
        // clear before starting the loop
        self.consumed_records.lock().await.clear();
        // infinite consumer loop
        debug!("Start consumer loop");
        loop {
            match consumer.stream().next().await {
                Some(Ok(msg)) => {
                    match self.handle_consumed_message(msg.detach()).await {
                        Ok(_) => {
                            continue;
                        }
                        Err(err) => {
                            self.notify_error("Consumer error", &err.to_string());
                            break; //todo: delete the consumer from the state
                        }
                    }
                }
                Some(Err(err)) => {
                    //todo: filter out end of partition
                    self.notify_error("Consumer error", &err.to_string());
                }
                None => (),
            }
        }
        debug!("Consumer loop completed");
    }

    async fn handle_consumed_message(&self, msg: OwnedMessage) -> Result<()> {
        trace!("Parsing record {:?}", msg);
        let record = self.parser.parse_record(msg).await?;
        // check if the record is beyond the consuming window
        // and skip if it is so
        if let ConsumeFrom::Custom { start_timestamp: _, stop_timestamp: Some(stop_timestamp) } = self.config.from {
            if let Some(current_timestamp) = record.timestamp {
                if stop_timestamp <= current_timestamp {
                    // skip push_record into the consumer record_state
                    //todo: disable consumption for the current partition
                    return Ok(());
                }
            }
        }
        self.consumed_records.lock().await.push(record);
        Ok(())
    }
}