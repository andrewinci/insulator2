use std::str::FromStr;

use apache_avro::{to_avro_datum, types::Value as AvroValue, Schema};
use serde_json::Value as JsonValue;

use super::{avro_parser::AvroParser, helpers::build_record_header, schema_provider::SchemaProvider};
use crate::lib::{error::Result, schema_registry::ResolvedAvroSchema, Error};

impl<S: SchemaProvider> AvroParser<S> {
    pub async fn json_to_avro(&self, json: &str, schema_name: &str) -> Result<Vec<u8>> {
        let schema = self.schema_provider.get_schema_by_name(schema_name).await?;
        Self::json_to_avro_with_schema(&self, json, schema)
    }

    pub fn json_to_avro_with_schema(&self, json: &str, schema: ResolvedAvroSchema) -> Result<Vec<u8>> {
        let json_value = JsonValue::from_str(json)?;
        let mut res = build_record_header(schema.schema_id);
        let avro_value = Self::json_to_avro_map(json_value, &schema)?;
        let mut avro_record = to_avro_datum(&schema.schema, avro_value).map_err(|err| Error::AvroParse {
            message: format!("{}\n{}", "Unable to parse the avro record", err),
        })?;
        res.append(&mut avro_record);
        Ok(res)
    }

    fn json_to_avro_map(j: JsonValue, s: &ResolvedAvroSchema) -> Result<AvroValue> {
        match (&s.schema, j) {
            (Schema::Null, JsonValue::Null) => Ok(AvroValue::Null),
            (Schema::Boolean, JsonValue::Bool(v)) => Ok(AvroValue::Boolean(v)),
            (Schema::String, JsonValue::String(s)) => Ok(AvroValue::String(s)),
            // numbers
            (Schema::Int, JsonValue::Number(n)) => Ok(AvroValue::Int(n.as_i64().unwrap() as i32)), //todo: handle
            // (Schema::Long, JsonValue::Number(n)) => todo!(),
            // (Schema::Float, JsonValue::Number(n)) => todo!(),
            // (Schema::Double, JsonValue::Number(n)) => todo!(),
            // (
            //     Schema::Decimal {
            //         precision,
            //         scale,
            //         inner,
            //     },
            //     JsonValue::Number(n),
            // ) => todo!(),
            // Schema::Array(_) => todo!(),
            // Schema::Map(_) => todo!(),
            // Schema::Union(_) => todo!(),
            // Schema::Record { name, aliases, doc, fields, lookup } => todo!(),
            // Schema::Enum { name, aliases, doc, symbols } => todo!(),
            // Schema::Fixed { name, aliases, doc, size } => todo!(),
            // Schema::Uuid => todo!(),
            // // time
            // Schema::Date => todo!(),
            // Schema::TimeMillis => todo!(),
            // Schema::TimeMicros => todo!(),
            // Schema::TimestampMillis => todo!(),
            // Schema::TimestampMicros => todo!(),
            // Schema::Duration => todo!(),
            // // ref
            // Schema::Ref { name } => todo!(),
            // todo:
            //(Schema::Bytes, JsonValue::String(s)) => todo!(),
            (_, _) => Err(Error::AvroParse {
                message: "Unsupported config".into(),
            }),
        }
    }
}
