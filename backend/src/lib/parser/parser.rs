use std::sync::Arc;

use crate::lib::{
    avro::{AvroParser, SchemaProvider},
    error::{Error, Result},
    schema_registry::CachedSchemaRegistry,
    types::{ParsedKafkaRecord, RawKafkaRecord},
};

use super::string_parser::parse_string;

pub enum ParserMode {
    String,
    Avro,
}

pub struct Parser<C: SchemaProvider = CachedSchemaRegistry> {
    avro_parser: Option<AvroParser<C>>,
}

impl<C: SchemaProvider> Parser<C> {
    pub fn new(schema_registry_client: Option<Arc<C>>) -> Self {
        Parser {
            avro_parser: schema_registry_client.map(|client| AvroParser::new(client)),
        }
    }

    pub async fn parse_from_kafka_record(&self, record: &RawKafkaRecord, mode: ParserMode) -> Result<ParsedKafkaRecord> {
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

    pub async fn parse_to_kafka_payload(&self, payload: &str, mode: ParserMode) -> Result<Vec<u8>> {
        todo!()
    }
}
