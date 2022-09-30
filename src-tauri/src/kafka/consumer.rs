mod client;
mod state;
mod setup_consumer;
mod parser;
mod notification;

use setup_consumer::setup_consumer;
pub use client::create_consumer;
use futures::StreamExt;
pub use state::{ ConsumerState, get_records_count };

use serde::{ Serialize, Deserialize };
use tauri::{ async_runtime::spawn };

use crate::{ configuration::Cluster, error::{ Result, TauriError } };

use self::{ state::{ ConsumerInfo, KafkaRecord, push_record }, parser::{ parse_record }, notification::notify_error };

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

    // spawn the consumer loop
    // add the consumer handle to the list of handles
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info.clone(),
            spawn(async move {
                let consumer = setup_consumer(&config);
                match consumer {
                    Err(err) => notify_error(err.to_owned(), &app),
                    // consumer loop
                    Ok(consumer) =>
                        loop {
                            match consumer.stream().next().await {
                                Some(Ok(msg)) =>
                                    match parse_record(msg.detach()) {
                                        Ok(record) => {
                                            let len = push_record(record, records_state.clone(), &consumer_info).await;
                                            notification::notify_records_count(len, &app, &consumer_info);
                                        }
                                        Err(err) => {
                                            notify_error(err, &app);
                                            break;
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

#[tauri::command]
pub async fn stop_consumer(consumer: ConsumerInfo, state: tauri::State<'_, ConsumerState>) -> Result<()> {
    if let Some(handle) = state.consumer_handles.lock().unwrap().remove(&consumer) {
        handle.abort();
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