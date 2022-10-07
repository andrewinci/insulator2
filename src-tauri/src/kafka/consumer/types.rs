use crate::configuration::Cluster;
use serde::{ Deserialize, Serialize };
use std::{ collections::HashMap, sync::{ Arc, Mutex } };
use tauri::async_runtime::JoinHandle;

#[derive(Serialize, Deserialize, Debug)]
pub enum ConsumeFrom {
    Beginning,
    End,
    Custom {
        start_timestamp: i64, //time in ms
        stop_timestamp: Option<i64>, //time in ms
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    pub cluster: Cluster,
    pub topic: String,
    pub from: ConsumeFrom,
    #[serde(rename = "useAvro")]
    pub use_avro: bool,
}

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

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerState {
    #[serde(rename = "isRunning")]
    pub is_running: bool,
    #[serde(rename = "recordCount")]
    pub record_count: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Event {
    consumer: ConsumerInfo,
    records_count: usize,
}