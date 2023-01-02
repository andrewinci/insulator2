use async_trait::async_trait;

use crate::lib::{error::Result, parser::Parser};

#[async_trait]
pub trait KafkaRecordParser {
    fn parse_to_string(&self, payload: &str) -> Vec<u8>;
    async fn parse_to_avro(&self, payload: &str, topic_name: &str) -> Result<Vec<u8>>;
}

#[async_trait]
impl KafkaRecordParser for Parser {
    fn parse_to_string(&self, payload: &str) -> Vec<u8> {
        self.parse_payload_to_string(payload)
    }
    async fn parse_to_avro(&self, payload: &str, topic_name: &str) -> Result<Vec<u8>> {
        self.parse_payload_to_avro(payload, topic_name).await
    }
}
