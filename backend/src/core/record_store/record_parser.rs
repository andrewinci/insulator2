use async_trait::async_trait;

use crate::core::{
    parser::Parser,
    types::{ParsedKafkaRecord, ParserMode, RawKafkaRecord},
};

use super::error::{StoreError, StoreResult};

#[async_trait]
pub trait KafkaRecordParser {
    async fn parse_kafka_record(&self, record: &RawKafkaRecord) -> StoreResult<ParsedKafkaRecord>;
}

#[async_trait]
impl KafkaRecordParser for Parser {
    async fn parse_kafka_record(&self, record: &RawKafkaRecord) -> StoreResult<ParsedKafkaRecord> {
        if let Ok(avro_record) = self.parse_from_kafka_record(record, ParserMode::Avro).await {
            Ok(avro_record)
        } else {
            self.parse_from_kafka_record(record, ParserMode::String)
                .await
                .map_err(|_| StoreError::RecordParse("Unable to parse the kafka record before storing".to_string()))
        }
    }
}
