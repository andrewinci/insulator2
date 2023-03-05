use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct RawKafkaRecord {
    pub payload: Option<Vec<u8>>,
    pub key: Option<Vec<u8>>,
    pub topic: String,
    /**
    Unix timestamp in ms
    */
    pub timestamp: Option<u64>,
    pub partition: i32,
    pub offset: i64,
    /**
     * Raw record size in bytes
     */
    pub record_bytes: usize,
    /*
     * todo: add
     * - header
     */
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct ParsedKafkaRecord {
    pub payload: Option<String>,
    pub key: Option<String>,
    pub topic: String,
    /**
    Unix timestamp in ms
    */
    pub timestamp: Option<u64>,
    pub partition: i32,
    pub offset: i64,
    pub schema_id: Option<i32>,
    /**
     * Raw record size in bytes
     */
    pub record_bytes: usize,
    /*
     * todo: add
     * - header
     */
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum ParserMode {
    String,
    Avro,
}
