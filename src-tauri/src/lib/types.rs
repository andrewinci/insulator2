use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KafkaRecord<T> {
    pub payload: Option<T>,
    pub key: Option<T>,
    pub topic: String,
    pub timestamp: Option<i64>,
    pub partition: i32,
    pub offset: i64,
    //todo: headers
}

pub type RawKafkaRecord = KafkaRecord<Vec<u8>>;
pub type ParsedKafkaRecord = KafkaRecord<String>;
