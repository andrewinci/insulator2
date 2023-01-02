mod error;
mod string_parser;

use std::sync::Arc;

use crate::lib::{
    avro::{AvroParser, SchemaProvider},
    schema_registry::CachedSchemaRegistry,
    types::{ParsedKafkaRecord, RawKafkaRecord},
};

use string_parser::parse_string;

pub use self::error::ParserError;
use self::error::ParserResult;

use super::types::ParserMode;

pub struct Parser<C: SchemaProvider = CachedSchemaRegistry> {
    avro_parser: Option<AvroParser<C>>,
}

impl<C: SchemaProvider> Parser<C> {
    pub fn new(schema_registry_client: Option<Arc<C>>) -> Self {
        Parser {
            avro_parser: schema_registry_client.map(|client| AvroParser::new(client)),
        }
    }

    pub async fn parse_from_kafka_record(
        &self,
        record: &RawKafkaRecord,
        mode: ParserMode,
    ) -> ParserResult<ParsedKafkaRecord> {
        let RawKafkaRecord {
            payload,
            key,
            topic,
            timestamp,
            partition,
            offset,
        } = record.clone();
        let (key, payload) = match mode {
            ParserMode::String => (key.map(|v| parse_string(&v)), payload.map(|v| parse_string(&v))),
            ParserMode::Avro => {
                let avro_parser = self.avro_parser.as_ref().ok_or(ParserError::MissingAvroConfiguration)?;
                (
                    key.map(|v| parse_string(&v)),
                    match payload {
                        Some(v) => Some(avro_parser.avro_to_json(&v).await?),
                        None => None,
                    },
                )
            }
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

    pub async fn parse_payload_to_avro(&self, payload: &str, topic_name: &str) -> ParserResult<Vec<u8>> {
        if let Some(avro_parser) = self.avro_parser.as_ref() {
            Ok(avro_parser
                .json_to_avro(payload, &format!("{}-value", topic_name))
                .await?)
        } else {
            Err(ParserError::MissingAvroConfiguration)
        }
    }

    pub fn parse_payload_to_string(&self, payload: &str) -> Vec<u8> {
        payload.as_bytes().into()
    }
}
