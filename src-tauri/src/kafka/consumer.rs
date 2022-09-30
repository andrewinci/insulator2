mod client;
mod state;
mod setup_consumer;
mod helpers;

use setup_consumer::setup_consumer;
pub use client::create_consumer;
use futures::StreamExt;
pub use state::ConsumerState;

use serde::{ Serialize, Deserialize };
use tauri::{ async_runtime::spawn };

use crate::{ configuration::Cluster, error::{ Result, TauriError } };

use self::{
    state::{ ConsumerInfo, KafkaRecord, push_record },
    helpers::{ parse_record, notify_client },
};

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    cluster: Cluster,
    topic: String,
}

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, ConsumerState>,
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

    // spawn the container
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info.clone(),
            spawn(async move {
                let consumer = setup_consumer(&config).expect("msg");
                // consumer loop
                loop {
                    // todo: handle the Err result
                    if let Some(Ok(raw_msg)) = consumer.stream().next().await {
                        let record = parse_record(raw_msg.detach()).expect("msg");
                        let len = push_record(record, records_state.clone(), &consumer_info).await;
                        notify_client(len, &app, &consumer_info).await;
                    }
                }
            })
        );
    Ok(())
}

#[tauri::command]
pub async fn stop_consumer(
    consumer: ConsumerInfo,
    state: tauri::State<'_, ConsumerState>
) -> Result<()> {
    if let Some(consumer_handle) = state.consumer_handles.lock().unwrap().get(&consumer) {
        // todo: maybe there is a cleaner way
        // todo: check double abort
        consumer_handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn get_record(
    consumer: ConsumerInfo,
    index: usize,
    state: tauri::State<'_, ConsumerState>
) -> Result<Option<KafkaRecord>> {
    if let Some(records) = state.records_state.lock().unwrap().get(&consumer) {
        if records.len() <= index { Ok(None) } else { Ok(Some(records[index].clone())) }
    } else {
        Ok(None)
    }
}