use std::str::FromStr;

use serde_json::Value as JsonValue;

use super::{avro_parser::AvroParser, helpers::build_record_header, schema_provider::SchemaProvider};
use crate::lib::{error::Result, schema_registry::ResolvedAvroSchema};

impl<S: SchemaProvider> AvroParser<S> {
    pub fn _json_to_avro(&self, json: &str, schema: ResolvedAvroSchema) -> Result<Vec<u8>> {
        let _json_value = JsonValue::from_str(json)?;
        let _header = build_record_header(schema.schema_id);

        todo!()
    }
}
