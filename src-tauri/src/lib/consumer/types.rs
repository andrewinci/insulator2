use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ConsumerOffsetConfiguration {
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