mod avro_parser;
mod client;
mod notification;
mod setup_consumer;
mod state;
mod string_parser;

use std::{ collections::HashMap, sync::{ Arc, Mutex } };

pub use client::create_consumer;
use futures::StreamExt;
use rdkafka::message::OwnedMessage;
use setup_consumer::setup_consumer;
pub use state::{ get_consumer_state, AppConsumers };

use tauri::async_runtime::spawn;

use crate::error::{ Result, TauriError };

use self::{
    avro_parser::parse_record as parse_avro_record,
    notification::notify_error,
    setup_consumer::{ ConsumeFrom, ConsumerConfig },
    state::{ push_record, ConsumerInfo, KafkaRecord },
    string_parser::parse_record as parse_string_record,
};

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, AppConsumers>,
    app: tauri::AppHandle
) -> Result<()> {
    let topic = config.topic.clone();
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: topic.clone(),
    };
    let records_state = state.records_state.clone();

    // check if the consumer is already running
    if state.consumer_handles.lock().unwrap().contains_key(&consumer_info) {
        return Err(TauriError {
            error_type: "Kafka consumer".into(),
            message: format!("Consumer for topic \"{}\" is already running", &topic),
        });
    }

    // init the records state
    records_state
        .lock()
        .unwrap()
        .insert(consumer_info.clone(), Vec::<_>::new());

    // spawn the consumer loop
    // add the consumer handle to the list of handles
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info,
            spawn(async move {
                let consumer = setup_consumer(&config);
                match consumer {
                    Err(err) => notify_error(err, &app),
                    // consumer loop
                    Ok(consumer) =>
                        loop {
                            match consumer.stream().next().await {
                                Some(Ok(msg)) => {
                                    match handle_consumed_message(msg.detach(), &config, records_state.clone()).await {
                                        Ok(_) => {
                                            continue;
                                        }
                                        Err(err) => {
                                            notify_error(err, &app);
                                            break; //todo: delete the consumer from the state
                                        }
                                    }
                                }
                                Some(Err(err)) => notify_error(err.into(), &app),
                                None => (),
                            }
                        }
                }
            })
        );
    Ok(())
}

async fn handle_consumed_message(
    msg: OwnedMessage,
    config: &ConsumerConfig,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>
) -> Result<()> {
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: config.topic.clone(),
    };
    let schema_registry = config.cluster.schema_registry.as_ref().ok_or_else(|| TauriError {
        error_type: "Missing schema registry configuration".into(),
        message: " Unable to use avro without a valid schema registry configuration".into(),
    })?;
    let record = if config.use_avro {
        parse_avro_record(msg, schema_registry).await?
    } else {
        parse_string_record(msg)?
    };
    // check if the record is beyond the consuming window
    // and skip if it is so
    if let ConsumeFrom::Custom { start_timestamp: _, stop_timestamp: Some(stop_timestamp) } = config.from {
        if let Some(current_timestamp) = record.timestamp {
            if stop_timestamp <= current_timestamp {
                // skip push_record into the consumer record_state
                //todo: disable consumption for the current partition
                return Ok(());
            }
        }
    }
    push_record(record, records_state.clone(), &consumer_info);
    Ok(())
}

#[tauri::command]
pub async fn stop_consumer(consumer: ConsumerInfo, state: tauri::State<'_, AppConsumers>) -> Result<()> {
    if let Some(handle) = state.consumer_handles.lock().unwrap().remove(&consumer) {
        handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn get_record(
    consumer: ConsumerInfo,
    index: usize,
    state: tauri::State<'_, AppConsumers>
) -> Result<Option<KafkaRecord>> {
    if let Some(records) = state.records_state.lock().unwrap().get(&consumer) {
        if records.len() <= index { Ok(None) } else { Ok(Some(records[index].clone())) }
    } else {
        Ok(None)
    }
}