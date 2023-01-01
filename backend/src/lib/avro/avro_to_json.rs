use super::{avro_parser::AvroParser, schema_provider::SchemaProvider};
use crate::lib::error::Result;

impl<S: SchemaProvider> AvroParser<S> {
    pub fn avro_to_json(&self, bin: &[u8]) -> Result<String> {
        todo!()
    }
}
