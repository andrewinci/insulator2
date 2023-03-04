use std::time::{Duration, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use time::format_description::well_known;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct KafkaRecord<T> {
    pub payload: Option<T>,
    pub key: Option<T>,
    pub topic: String,
    /**
    Unix timestamp in ms
    */
    pub timestamp: Option<u64>,
    pub partition: i32,
    pub offset: i64,
    /*
     * todo: add
     * - header
     * - record size
     * - schema-id
     */
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum ParserMode {
    String,
    Avro,
}

pub type RawKafkaRecord = KafkaRecord<Vec<u8>>;
pub type ParsedKafkaRecord = KafkaRecord<String>;
