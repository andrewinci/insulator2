use super::avro_schema::{AvroSchema as Schema, RecordField};
use super::{
    avro_parser::AvroParser,
    error::{AvroError, AvroResult},
    helpers::get_schema_id_from_record_header,
    schema_provider::SchemaProvider,
};
use apache_avro::{from_avro_datum, types::Value as AvroValue};
use num_bigint::BigInt;
use rust_decimal::Decimal;
use serde_json::{json, Map, Value as JsonValue};
use std::{collections::HashMap, io::Cursor};

impl<S: SchemaProvider> AvroParser<S> {
    pub async fn avro_to_json(&self, raw: &[u8]) -> AvroResult<(i32, String)> {
        // retrieve the schema from the id on the record header
        let id = get_schema_id_from_record_header(raw)?;

        let schema = self.schema_provider.get_schema_by_id(id).await?;
        let mut data = Cursor::new(&raw[5..]);

        // parse the avro record into an AvroValue
        let record = from_avro_datum(&schema.inner_schema, &mut data, None)
            .map_err(|err| AvroError::ParseAvroValue(err.to_string()))?;
        let json = map(&record, &schema.schema)?;
        let res = serde_json::to_string(&json).map_err(|err| AvroError::ParseJsonValue(err.to_string()))?;
        Ok((id, res))
    }
}

fn map(value: &AvroValue, schema: &Schema) -> AvroResult<JsonValue> {
    match (value, schema) {
        (AvroValue::Null, Schema::Null) => Ok(JsonValue::Null),
        (AvroValue::Boolean(v), Schema::Boolean) => Ok(json!(*v)),
        (AvroValue::Int(v), Schema::Int) => Ok(json!(*v)),
        (AvroValue::Long(v), Schema::Long) => Ok(json!(*v)),
        (AvroValue::Float(v), Schema::Float) => Ok(json!(*v)),
        (AvroValue::Double(v), Schema::Double) => Ok(json!(*v)),
        (AvroValue::String(v), Schema::String) => Ok(json!(*v)),
        (AvroValue::Array(v), Schema::Array(s)) => parse_array(v, s),
        (AvroValue::Map(vec), Schema::Map(s)) => parse_map(vec, s),
        (AvroValue::Record(vec), Schema::Record { fields, lookup, .. }) => parse_record(vec, lookup, fields),
        (AvroValue::Date(v), Schema::Date) => Ok(json!(*v)),
        (AvroValue::TimeMillis(v), Schema::TimeMillis) => Ok(json!(*v)),
        (AvroValue::TimeMicros(v), Schema::TimeMicros) => Ok(json!(*v)),
        (AvroValue::TimestampMillis(v), Schema::TimestampMillis) => Ok(json!(*v)),
        (AvroValue::TimestampMicros(v), Schema::TimestampMicros) => Ok(json!(*v)),
        (AvroValue::Uuid(v), Schema::Uuid) => Ok(json!(v.to_string())),
        (AvroValue::Bytes(v), Schema::Bytes) => Ok(json!(*v)),
        (AvroValue::Decimal(v), Schema::Decimal { scale, .. }) => parse_decimal(v, scale),
        // (AvroValue::Duration(v), Schema::Duration) => Ok(json!(format!(
        //     "{:?} months {:?} days {:?} millis",
        //     v.months(),
        //     v.days(),
        //     v.millis()
        // ))),
        (AvroValue::Union(i, v), Schema::Union(s)) => {
            if **v == AvroValue::Null {
                Ok(JsonValue::Null)
            } else {
                let schema = s.get(*i as usize).ok_or_else(|| {
                    AvroError::InvalidUnion(format!("Missing schema index {} in the union {:?}", *i, s))
                })?;
                let value = map(v, schema)?;
                Ok(json!({ schema.fqn().split('.').last().expect("Schema FQN should not be empty"): value }))
            }
        }
        (AvroValue::Enum(_, v), Schema::Enum { name: _, .. }) => Ok(json!(*v)),
        (AvroValue::Fixed(_, v), Schema::Fixed { .. }) => Ok(json!(*v)),
        (v, s) => Err(AvroError::Unsupported(format!(
            "Unexpected value {v:?} for schema {s:?}"
        ))),
    }
}

fn parse_decimal(v: &apache_avro::Decimal, scale: &usize) -> AvroResult<JsonValue> {
    // the representation of the decimal in avro is the number in binary with
    // the scale encoded in the schema. Therefore we convert the bin array into a big int
    // and then use rust_decimal to set the scale to the big int ending up with a decimal value.
    // Since decimal is not supported by json_serde we need to convert it to the f64 in order to show it
    // as json number.
    let arr = <Vec<u8>>::try_from(v).map_err(|err| AvroError::InvalidNumber(err.to_string()))?;
    let value = BigInt::from_signed_bytes_be(&arr);
    let num = i64::try_from(value).map_err(|err| AvroError::InvalidNumber(err.to_string()))?;
    let decimal = Decimal::new(num, scale.to_owned() as u32);
    //let float: String = decimal.to_string().parse().unwrap();
    Ok(json!(decimal.to_string()))
}

fn parse_record(
    vec: &[(String, AvroValue)],
    lookup: &std::collections::BTreeMap<String, usize>,
    fields: &[RecordField],
) -> AvroResult<JsonValue> {
    let mut json_map = Map::new();
    for (k, v) in vec.iter() {
        let field_index = lookup.get(k).ok_or_else(|| AvroError::MissingField(k.to_string()))?;
        json_map.insert(k.clone(), map(v, &fields.get(*field_index).unwrap().schema)?);
    }
    Ok(JsonValue::Object(json_map))
}

fn parse_map(vec: &HashMap<String, AvroValue>, s: &Schema) -> AvroResult<JsonValue> {
    let mut json_map = Map::new();
    for (k, v) in vec.iter() {
        json_map.insert(k.clone(), map(v, s)?);
    }
    Ok(JsonValue::Object(json_map))
}

fn parse_array(v: &[AvroValue], s: &Schema) -> AvroResult<JsonValue> {
    let mut json_vec = Vec::new();
    for v in v.iter() {
        json_vec.push(map(v, s)?);
    }
    Ok(JsonValue::Array(json_vec))
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use apache_avro::{to_avro_datum, types::Record, types::Value as AvroValue, Schema as ApacheAvroSchema, Writer};
    use async_trait::async_trait;

    use crate::core::avro::{error::AvroResult, ResolvedAvroSchema};

    use super::{AvroParser, SchemaProvider};
    struct MockSchemaRegistry {
        schema: String,
    }

    #[async_trait]
    impl SchemaProvider for MockSchemaRegistry {
        async fn get_schema_by_id(&self, _: i32) -> AvroResult<ResolvedAvroSchema> {
            Ok(ResolvedAvroSchema::from(
                123,
                &ApacheAvroSchema::parse_str(&self.schema).unwrap(),
            ))
        }
        async fn get_schema_by_name(&self, _name: &str) -> AvroResult<ResolvedAvroSchema> {
            todo!()
        }
    }

    fn get_sut(schema: String) -> AvroParser<MockSchemaRegistry> {
        AvroParser::new(Arc::new(MockSchemaRegistry { schema }))
    }

    #[tokio::test]
    async fn test_simple_types_parsing() {
        let raw_schema = r#"
    {
        "fields": [
            { "name": "null_field", "type": "null" },
            { "name": "boolean_field", "type": "boolean" },
            { "name": "int_field", "type": "int" },
            { "name": "long_field", "type": "long" },
            { "name": "float_field", "type": "float" },
            { "name": "double_field", "type": "double" },
            { "name": "bytes_field", "type": "bytes" },
            { "name": "string_field", "type": "string" }
        ],
        "name": "sampleRecord",
        "namespace": "com.example.namespace",
        "type": "record"}"#;
        let schema = ApacheAvroSchema::parse_str(raw_schema).unwrap();
        let writer = Writer::new(&schema, Vec::new());
        let mut record = Record::new(writer.schema()).unwrap();
        record.put("null_field", AvroValue::Null);
        record.put("boolean_field", true);
        record.put("int_field", 12);
        record.put("long_field", 12345667);
        record.put("float_field", 123.123f32);
        record.put("double_field", 12.12f64);
        record.put("bytes_field", AvroValue::Bytes(vec![0x01, 0x02, 0xaa]));
        record.put("string_field", "YO!! test");
        let mut encoded = to_avro_datum(&schema, record).unwrap();
        // add 1 magic byte + 4 id bytes
        let mut raw: Vec<u8> = vec![0x00, 0x00, 0x00, 0x00, 0x00];
        raw.append(&mut encoded);

        let res = get_sut(raw_schema.to_string()).avro_to_json(&raw[..]).await.unwrap();

        assert_eq!(
            res.1,
            r#"{"boolean_field":true,"bytes_field":[1,2,170],"double_field":12.12,"float_field":123.123,"int_field":12,"long_field":12345667,"null_field":null,"string_field":"YO!! test"}"#
        )
    }
}
