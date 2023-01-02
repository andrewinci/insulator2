use async_trait::async_trait;

use crate::lib::{
    error::LibResult,
    parser::Parser,
    types::{ParsedKafkaRecord, ParserMode, RawKafkaRecord},
};

#[async_trait]
pub trait KafkaRecordParser {
    async fn parse_kafka_record(&self, record: &RawKafkaRecord) -> LibResult<ParsedKafkaRecord>;
}

#[async_trait]
impl KafkaRecordParser for Parser {
    async fn parse_kafka_record(&self, record: &RawKafkaRecord) -> LibResult<ParsedKafkaRecord> {
        if let Ok(avro_record) = self.parse_from_kafka_record(record, ParserMode::Avro).await {
            Ok(avro_record)
        } else {
            self.parse_from_kafka_record(record, ParserMode::String).await
        }
    }
}
