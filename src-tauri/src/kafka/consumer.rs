use std::time::Duration;

use serde::{ Serialize, Deserialize };
use tauri::{ async_runtime::spawn, Manager };

use crate::{ configuration::Cluster, error::{ Result, TauriError } };
use super::consumer_state::{ ConsumerState, ConsumerInfo, KafkaRecord };

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    cluster: Cluster,
    topic: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Event {
    consumer: ConsumerInfo,
    records_count: usize,
}

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, ConsumerState>,
    app: tauri::AppHandle
) -> Result<()> {
    let topic = config.topic;
    let consumer_info = ConsumerInfo { cluster_id: config.cluster.id, topic: topic.clone() };
    let records_state = state.records_state.clone();
    if state.consumer_handles.lock().unwrap().contains_key(&consumer_info) {
        return Err(TauriError {
            error_type: "Kafka consumer".into(),
            message: format!("Consumer for topic \"{}\" is already running", &topic),
        }); //consumer already running
    }
    // spawn the container
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info.clone(),
            spawn(async move {
                records_state
                    .lock()
                    .unwrap()
                    .insert(consumer_info.clone(), Vec::<_>::new());
                let mut i = 1;
                // consumer loop
                loop {
                    tokio::time::sleep(Duration::from_secs(1)).await; //replace with the actual consumer
                    let mut records_map = records_state.lock().unwrap();
                    let records = records_map
                        .get_mut(&consumer_info)
                        .expect("The map record was created above");
                    records.push(KafkaRecord {
                        key: "sample key".into(),
                        value: i.clone().to_string(),
                    });
                    i += 1;
                    app.app_handle()
                        .emit_all(format!("consumer_{}", topic.clone()).as_str(), Event {
                            consumer: consumer_info.clone(),
                            records_count: records.len(),
                        })
                        .expect("unable to send a notification to the frontend");
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
        // maybe there is a cleaner way
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