use async_trait::async_trait;

use crate::lib::{error::Result, parser::Parser};

#[async_trait]
pub trait KafkaRecordParser {
    async fn parse_to_kafka_payload(&self, payload: &str) -> Result<Vec<u8>>;
}

#[async_trait]
impl KafkaRecordParser for Parser {
    async fn parse_to_kafka_payload(&self, payload: &str) -> Result<Vec<u8>> {
        todo!()
    }
}
