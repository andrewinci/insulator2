use std::{ collections::HashMap, sync::{ Mutex, Arc } };

use serde::{ Serialize, Deserialize };
use tauri::async_runtime::JoinHandle;

use crate::error::{ Result };

#[derive(Debug, Default)]
pub struct AppConsumers {
    pub consumer_handles: Mutex<HashMap<ConsumerInfo, JoinHandle<()>>>,
    pub records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>,
}

#[derive(Serialize, Deserialize, Debug, Hash, Eq, PartialEq, Clone)]
pub struct ConsumerInfo {
    pub cluster_id: String,
    pub topic: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KafkaRecord {
    pub key: Option<String>,
    pub value: Option<String>,
    pub offset: i64,
    pub partition: i32,
    pub timestamp: Option<i64>,
}

pub(super) fn push_record(
    record: KafkaRecord,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>,
    consumer_info: &ConsumerInfo
) -> usize {
    let mut records_map = records_state.lock().unwrap();
    let records = records_map.get_mut(consumer_info).expect("The map record was created above");
    records.push(record);
    records.len()
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerState {
    #[serde(rename = "isRunning")]
    is_running: bool,
    #[serde(rename = "recordCount")]
    record_count: usize,
}

#[tauri::command]
pub async fn get_consumer_state(
    consumer: ConsumerInfo,
    state: tauri::State<'_, AppConsumers>
) -> Result<ConsumerState> {
    let is_running = state.consumer_handles.lock().unwrap().get(&consumer).is_some();
    let record_count = state.records_state
        .lock()
        .unwrap()
        .get(&consumer)
        .map(|r| r.len())
        .unwrap_or(0);
    Ok(ConsumerState {
        is_running,
        record_count,
    })
}