use std::{
    sync::Arc,
    time::{Duration, UNIX_EPOCH},
};

//use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use time::format_description::well_known;

use super::Error;

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
    //todo: headers
}

pub type RawKafkaRecord = KafkaRecord<Vec<u8>>;
pub type ParsedKafkaRecord = KafkaRecord<String>;
pub type ErrorCallback = Arc<dyn Fn(Error) + Send + Sync>;

impl ParsedKafkaRecord {
    pub fn to_csv_line(&self, parse_timestamp: bool) -> String {
        let unix_timestamp = self.timestamp.unwrap_or_default();
        let timestamp = if parse_timestamp {
            // Creates a new SystemTime from the specified number of whole seconds
            let d = UNIX_EPOCH + Duration::from_millis(unix_timestamp);
            // Create DateTime from SystemTime
            time::OffsetDateTime::from(d).format(&well_known::Rfc3339).unwrap()
        } else {
            unix_timestamp.to_string()
        };
        format!(
            "{};{};{};{};{}",
            timestamp,
            self.partition,
            self.offset,
            self.key.clone().unwrap_or_default(),
            self.payload.clone().unwrap_or_default()
        )
    }
}

impl ParsedKafkaRecord {
    pub(crate) fn to_string_header() -> String {
        format!("{};{};{};{};{}", "timestamp", "partition", "offset", "key", "payload")
    }
}
