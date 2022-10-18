use std::sync::Arc;

use async_trait::async_trait;

use crate::lib::{
    error::{Error, Result},
    schema_registry::SchemaRegistryClient,
    types::{ParsedKafkaRecord, RawKafkaRecord},
};

use super::{avro_parser::AvroParser, string_parser::parse_string};

pub enum ParserMode {
    String,
    Avro,
}

#[async_trait]
pub trait Parser {
    async fn parse_record(
        &self,
        record: &RawKafkaRecord,
        mode: ParserMode,
    ) -> Result<ParsedKafkaRecord>;
}

pub struct RecordParser {
    avro_parser: Option<AvroParser>,
}

impl RecordParser {
    pub fn new(
        schema_registry_client: Option<Arc<dyn SchemaRegistryClient + Send + Sync>>,
    ) -> RecordParser {
        RecordParser {
            avro_parser: schema_registry_client.map(|client| AvroParser::new(client)),
        }
    }
}

#[async_trait]
impl Parser for RecordParser {
    async fn parse_record(
        &self,
        record: &RawKafkaRecord,
        mode: ParserMode,
    ) -> Result<ParsedKafkaRecord> {
        let RawKafkaRecord {
            payload,
            key,
            topic,
            timestamp,
            partition,
            offset,
        } = record.clone();
        let avro_parser = self.avro_parser.as_ref().ok_or(Error::AvroParse {
            message: "Missing avro parser".into(),
        })?;
        let (key, payload) = match mode {
            ParserMode::String => (
                key.map(|v| parse_string(&v)),
                payload.map(|v| parse_string(&v)),
            ),
            ParserMode::Avro => (
                key.map(|v| parse_string(&v)),
                match payload {
                    Some(v) => Some(avro_parser.parse_payload(&v).await?),
                    None => None,
                },
            ),
        };
        Ok(ParsedKafkaRecord {
            key,
            payload,
            topic,
            timestamp,
            partition,
            offset,
        })
    }
}
