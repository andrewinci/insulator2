use std::time::Duration;

use serde::{ Serialize, Deserialize };
use tauri::async_runtime::spawn;

use crate::{ configuration::Cluster, error::Result };
use super::consumer_state::{ ConsumerState, ConsumerInfo, KafkaRecord };

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    cluster: Cluster,
    topic: String,
}

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, ConsumerState>
) -> Result<()> {
    let consumer_info = ConsumerInfo { cluster_id: config.cluster.id, topic: config.topic };
    let consumer_info2 = consumer_info.clone();
    let records_state = state.records_state.clone();
    let consumer = spawn(async move {
        records_state
            .lock()
            .unwrap()
            .insert(consumer_info.clone(), Vec::<_>::new());
        let mut i = 1;
        loop {
            tokio::time::sleep(Duration::from_secs(1)).await; //replace with the actual consumer
            records_state
                .lock()
                .unwrap()
                .get_mut(&consumer_info)
                .expect("Expected records")
                .push(KafkaRecord { key: "sample key".into(), value: i.clone().to_string() });
            i += 1;
        }
    });
    state.consumer_handles.lock().unwrap().insert(consumer_info2, consumer);
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