use std::sync::Arc;

use async_trait::async_trait;

use crate::lib::{
    error::{Error, Result},
    schema_registry::CachedSchemaRegistry,
    types::{ParsedKafkaRecord, RawKafkaRecord},
};

use super::{avro_parser::AvroParser, schema_provider::SchemaProvider, string_parser::parse_string};

pub enum ParserMode {
    String,
    Avro,
}

#[async_trait]
pub trait Parser {
    async fn parse_record(&self, record: &RawKafkaRecord, mode: ParserMode) -> Result<ParsedKafkaRecord>;
}

pub struct RecordParser<C: SchemaProvider = CachedSchemaRegistry> {
    avro_parser: Option<AvroParser<C>>,
}

impl<C: SchemaProvider> RecordParser<C> {
    pub fn new(schema_registry_client: Option<Arc<C>>) -> Self {
        RecordParser {
            avro_parser: schema_registry_client.map(|client| AvroParser::new(client)),
        }
    }
}

#[async_trait]
impl<C: SchemaProvider> Parser for RecordParser<C> {
    async fn parse_record(&self, record: &RawKafkaRecord, mode: ParserMode) -> Result<ParsedKafkaRecord> {
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
                let avro_parser = self.avro_parser.as_ref().ok_or(Error::AvroParse {
                    message: "Missing avro parser".into(),
                })?;
                (
                    key.map(|v| parse_string(&v)),
                    match payload {
                        Some(v) => Some(avro_parser.parse_payload(&v).await?),
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
}
