use async_trait::async_trait;

use crate::lib::{error::Result, parser::Parser};

#[async_trait]
pub trait KafkaRecordParser {
    async fn parse_to_kafka_payload(&self, payload: &str, topic_name: &str) -> Result<Vec<u8>>;
}

#[async_trait]
impl KafkaRecordParser for Parser {
    async fn parse_to_kafka_payload(&self, payload: &str, topic_name: &str) -> Result<Vec<u8>> {
        //todo: allow the user to pick the serialization
        if let Some(v) = self.parse_payload_to_avro(payload, topic_name).await {
            Ok(v?)
        } else {
            Ok(self.parse_payload_to_string(payload))
        }
    }
}
