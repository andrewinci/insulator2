use std::{ collections::HashMap, sync::{ Mutex, Arc } };

use serde::{ Serialize, Deserialize };
use tauri::async_runtime::JoinHandle;

use crate::error::{ TauriError, Result };

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
}

pub(super) async fn push_record(
    record: KafkaRecord,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>,
    consumer_info: &ConsumerInfo
) -> usize {
    let mut records_map = records_state.lock().unwrap();
    let records = records_map.get_mut(consumer_info).expect("The map record was created above");
    records.push(record);
    records.len()
}

#[tauri::command]
pub fn get_records_count(consumer: ConsumerInfo, state: tauri::State<'_, AppConsumers>) -> Result<usize> {
    if let Some(records) = state.records_state.lock().unwrap().get(&consumer) {
        Ok(records.len())
    } else {
        Err(TauriError {
            error_type: "Get record count".into(),
            message: format!("Consumer {:?} not found", consumer),
        })
    }
}