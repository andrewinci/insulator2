use std::str::FromStr;

use serde_json::Value as JsonValue;

use super::{avro_parser::AvroParser, schema_provider::SchemaProvider};
use crate::lib::{error::Result, schema_registry::ResolvedAvroSchema};

impl<S: SchemaProvider> AvroParser<S> {
    pub fn _json_to_avro(&self, json: &str, _schema: ResolvedAvroSchema) -> Result<Vec<u8>> {
        let _json_value = JsonValue::from_str(json)?;
        todo!()
    }
}
