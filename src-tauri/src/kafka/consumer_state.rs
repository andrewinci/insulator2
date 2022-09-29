use std::{ collections::HashMap, sync::{ Mutex, Arc } };

use serde::{ Serialize, Deserialize };
use tauri::async_runtime::JoinHandle;

#[derive(Debug, Default)]
pub struct ConsumerState {
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
    pub key: String,
    pub value: String,
}