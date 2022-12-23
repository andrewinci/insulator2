use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ConsumerConfiguration {
    pub compactify: bool,
    pub consumer_start_config: ConsumerSessionConfiguration,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ConsumerSessionConfiguration {
    Beginning,
    End,
    Custom {
        start_timestamp: i64, //time in ms
        stop_timestamp: Option<i64>, //time in ms
    },
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConsumerState {
    #[serde(rename = "isRunning")]
    pub is_running: bool,
    #[serde(rename = "recordCount")]
    pub record_count: usize,
}