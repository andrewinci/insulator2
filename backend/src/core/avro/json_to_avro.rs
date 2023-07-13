use std::{collections::HashMap, str::FromStr};

use apache_avro::{to_avro_datum, types::Value as AvroValue};
use log::debug;
use num_bigint::BigInt;
use uuid::Uuid;

use super::{
    avro_parser::AvroParser,
    avro_schema::{AvroSchema as Schema, RecordField},
    error::AvroResult,
    helpers::build_record_header,
    schema_provider::SchemaProvider,
    AvroError, ResolvedAvroSchema,
};

use serde_json::Value as JsonValue;

impl<S: SchemaProvider> AvroParser<S> {
    pub async fn json_to_avro(&self, json: &str, schema_name: &str) -> AvroResult<Vec<u8>> {
        let schema = self.schema_provider.get_schema_by_name(schema_name).await?;
        Self::json_to_avro_with_schema(self, json, schema)
    }

    pub fn json_to_avro_with_schema(&self, json: &str, schema: ResolvedAvroSchema) -> AvroResult<Vec<u8>> {
        let json_value = JsonValue::from_str(json).map_err(|err| AvroError::ParseJsonValue(err.to_string()))?;
        let mut res = build_record_header(schema.id);
        let avro_value = json_to_avro_map(&json_value, &schema.schema)?;
        debug!("Parsing: {:?}\n\tUsing schema: {:?}", avro_value, &schema.schema);
        let mut avro_record =
            to_avro_datum(&schema.inner_schema, avro_value).map_err(|err| AvroError::ParseAvroValue(err.to_string()))?;
        res.append(&mut avro_record);
        Ok(res)
    }
}

fn json_to_avro_map(json_value: &JsonValue, schema: &Schema) -> AvroResult<AvroValue> {
    match (&schema, json_value) {
        // complex types
        (Schema::Record { fields, .. }, JsonValue::Object(obj)) => map_json_fields_to_record(fields, obj),
        (Schema::Array(items_schema), JsonValue::Array(values)) => map_json_array_to_avro(values, items_schema),
        (Schema::Union(union_schemas), JsonValue::Null) => {
            let (position, _) = union_schemas
                .iter()
                .enumerate()
                .find(|(_, s)| *s == &Schema::Null)
                .ok_or_else(|| {
                    AvroError::InvalidUnion(format!(
                        "Cannot set null to the union. Supported options are: {union_schemas:?}"
                    ))
                })?;
            Ok(AvroValue::Union(position as u32, AvroValue::Null.into()))
        }
        (Schema::Union(union_schemas), JsonValue::Object(obj)) => map_union(obj, union_schemas),
        (Schema::Map(schema), JsonValue::Object(obj)) => {
            let mut avro_map = HashMap::new();
            for (key, value) in obj {
                avro_map.insert(key.to_string(), json_to_avro_map(value, schema)?);
            }
            Ok(AvroValue::Map(avro_map))
        }
        // simple types
        (Schema::Null, JsonValue::Null) => Ok(AvroValue::Null),
        (Schema::Boolean, JsonValue::Bool(v)) => Ok(AvroValue::Boolean(*v)),
        (Schema::String, JsonValue::String(s)) => Ok(AvroValue::String(s.clone())),
        (Schema::Enum { symbols, .. }, JsonValue::String(s)) => {
            let (index, value) = symbols
                .iter()
                .enumerate()
                .find(|(_, v)| v.to_string().eq(s))
                .ok_or_else(|| AvroError::InvalidEnum(format!("Invalid enum {s} expected one of {symbols:?}")))?;
            Ok(AvroValue::Enum(index as u32, value.into()))
        }
        // numbers
        (Schema::Int, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to Int")))?;
            Ok(AvroValue::Int(n))
        }
        (Schema::Long, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to Long")))?;
            Ok(AvroValue::Long(n))
        }
        (Schema::Float, JsonValue::Number(n)) => {
            let n = n
                .as_f64()
                .map(|v| v as f32)
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to Float")))?;
            Ok(AvroValue::Float(n))
        }
        (Schema::Double, JsonValue::Number(n)) => {
            let n = n
                .as_f64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to Double")))?;
            Ok(AvroValue::Double(n))
        }
        (Schema::Decimal { scale, .. }, JsonValue::Number(n)) => {
            Ok(AvroValue::Decimal(parse_decimal(&n.to_string(), *scale as u32)?))
        }
        // time
        (Schema::Date, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to a valid Date.")))?;
            Ok(AvroValue::Date(n))
        }
        (Schema::TimeMillis, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to a valid TimeMillis.")))?;
            Ok(AvroValue::TimeMillis(n))
        }
        (Schema::TimestampMillis, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to a valid TimestampMillis.")))?;
            Ok(AvroValue::TimestampMillis(n))
        }
        (Schema::TimeMicros, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to a valid TimeMicros.")))?;
            Ok(AvroValue::TimeMicros(n))
        }
        (Schema::TimestampMicros, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {n} to a valid TimestampMicros.")))?;
            Ok(AvroValue::TimestampMicros(n))
        }
        (Schema::Uuid, JsonValue::String(v)) => {
            let uuid =
                Uuid::parse_str(v).map_err(|_| AvroError::InvalidUUID(format!("Unable to parse {v} into a uuid")))?;
            Ok(AvroValue::Uuid(uuid))
        }

        // todo
        // Schema::Fixed { name, aliases, doc, size } => todo!(),
        //(Schema::Bytes, JsonValue::String(s)) => todo!(),
        // (Schema::Duration,  => todo!(),
        (schema, value) => Err(AvroError::Unsupported(format!(
            "Unable to use value {value:?} for schema {schema:?}"
        ))),
    }
}

fn parse_decimal(n: &str, scale: u32) -> AvroResult<apache_avro::Decimal> {
    let mut decimal = rust_decimal::Decimal::from_str(n)
        .map_err(|_| AvroError::InvalidNumber(format!("Unable to convert {n} to Decimal")))?;
    if decimal.scale() > scale {
        return Err(AvroError::InvalidNumber(format!(
            "Unable to convert {n} to Decimal. Max scale must be {scale}"
        )));
    }
    decimal.rescale(scale);
    let str_number = decimal.to_string().replace('.', "");
    let bi: BigInt = str_number.parse().unwrap();
    let vec: Vec<u8> = bi.to_signed_bytes_be();
    Ok(apache_avro::Decimal::from(vec))
}

fn map_union(obj: &serde_json::Map<String, JsonValue>, union_schemas: &Vec<Schema>) -> Result<AvroValue, AvroError> {
    let fields_vec: Vec<(&String, &JsonValue)> = obj.iter().collect();
    if fields_vec.len() != 1 {
        Err(AvroError::InvalidUnion(format!(
            "Invalid union. Expected one of: {union_schemas:?}"
        )))
    } else {
        let (union_branch_name, value) = *fields_vec.first().unwrap();
        let index_schema = union_schemas
            .iter()
            .enumerate()
            .find(|(_, schema)| schema.fqn().eq(union_branch_name));
        if let Some((index, current_schema)) = index_schema {
            let value = json_to_avro_map(value, current_schema)?;
            Ok(AvroValue::Union(index as u32, value.into()))
        } else {
            let union_variants: Vec<_> = union_schemas.iter().map(|schema| schema.fqn()).collect();
            Err(AvroError::InvalidUnion(format!(
                "Unsupported union specifier: {union_branch_name}. Supported variants are: {union_variants:?}"
            )))
        }
    }
}

fn map_json_array_to_avro(values: &Vec<JsonValue>, items_schema: &Schema) -> Result<AvroValue, AvroError> {
    let mut vec = vec![];
    for value in values {
        let avro_value = json_to_avro_map(value, items_schema)?;
        vec.push(avro_value);
    }
    Ok(AvroValue::Array(vec))
}

fn map_json_fields_to_record(
    fields: &Vec<RecordField>,
    obj: &serde_json::Map<String, JsonValue>,
) -> Result<AvroValue, AvroError> {
    let mut record_fields: Vec<(String, AvroValue)> = vec![];
    for field in fields {
        let field_value = obj
            .get(&field.name)
            .ok_or_else(|| AvroError::MissingField(field.name.clone()))?;
        let avro_field = json_to_avro_map(field_value, &field.schema)?;
        record_fields.push((field.name.clone(), avro_field));
    }
    Ok(AvroValue::Record(record_fields))
}

#[cfg(test)]
mod tests {

    use std::collections::BTreeMap;

    use super::map_json_fields_to_record;
    use super::parse_decimal;
    use crate::core::avro::avro_schema::AvroSchema;
    use crate::core::avro::avro_schema::RecordField;
    use crate::core::avro::error::AvroResult;
    use crate::core::avro::AvroError;
    use crate::core::avro::AvroParser;
    use crate::core::avro::ResolvedAvroSchema;
    use crate::core::avro::SchemaProvider;
    use apache_avro::Schema;

    use apache_avro::types::Value as AvroValue;
    use async_trait::async_trait;
    use serde_json::json;
    use serde_json::Value as JsonValue;

    struct MockSchemaProvider {}
    #[async_trait]
    impl SchemaProvider for MockSchemaProvider {
        async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema> {
            let json_schema = &get_test_avro_schema();
            let schema = Schema::parse_str(json_schema).expect("invalid test schema");
            Ok(ResolvedAvroSchema::from(id, &schema))
        }
        async fn get_schema_by_name(&self, _: &str) -> AvroResult<ResolvedAvroSchema> {
            let json_schema = &get_test_avro_schema();
            let schema = Schema::parse_str(json_schema).expect("invalid test schema");
            Ok(ResolvedAvroSchema::from(123, &schema))
        }
    }

    #[tokio::test]
    async fn test_e2e() {
        let mock_provider = MockSchemaProvider {};
        let sut = AvroParser::new(mock_provider.into());
        let sample_json = &get_test_avro_message();
        let res = sut.json_to_avro(sample_json, "sample").await;
        assert!(res.is_ok())
    }

    #[test]
    fn test_decimal() {
        // happy path
        {
            let res = parse_decimal("12.3", 2_u32).unwrap();
            assert_eq!(format!("{res:?}"), "Decimal { value: 1230, len: 2 }");
        }
        {
            let res = parse_decimal("12.3", 1_u32).unwrap();
            assert_eq!(format!("{res:?}"), "Decimal { value: 123, len: 1 }");
        }
        // error when unable to scale
        {
            let res = parse_decimal("12.334", 1_u32);
            assert!(res.is_err())
        }
    }

    #[test]
    fn test_map_record() {
        let obj = {
            let mut obj_map = serde_json::Map::new();
            obj_map.insert("sample".to_string(), json!(1));
            obj_map
        };
        let fields = vec![build_record_field("sample", AvroSchema::Int)];

        // happy path
        {
            let res = map_json_fields_to_record(&fields, &obj);
            assert_eq!(
                res,
                Ok(AvroValue::Record(vec![("sample".to_string(), AvroValue::Int(1))]))
            );
        }

        // parse a json object with a missing field return an error
        {
            let fields = vec![
                build_record_field("sample", AvroSchema::Int),
                build_record_field("sample_2", AvroSchema::Int),
            ];
            let res = map_json_fields_to_record(&fields, &obj);
            assert_eq!(res, Err(AvroError::MissingField("sample_2".into())))
        }

        // parse nested record
        {
            let obj_parent = {
                let mut obj_map = serde_json::Map::new();
                obj_map.insert("sample".into(), json!(2));
                obj_map.insert("nested".into(), JsonValue::Object(obj));
                obj_map
            };
            let nested_schema = AvroSchema::Record {
                name: "Nested".into(),
                fields: fields,
                lookup: BTreeMap::new(),
            };
            let fields = vec![
                build_record_field("sample", AvroSchema::Int),
                build_record_field("nested", nested_schema),
            ];
            let res = map_json_fields_to_record(&fields, &obj_parent);
            assert_eq!(
                res,
                Ok(AvroValue::Record(vec![
                    ("sample".to_string(), AvroValue::Int(2)),
                    (
                        "nested".to_string(),
                        AvroValue::Record(vec![("sample".into(), AvroValue::Int(1))])
                    ),
                ]))
            );
        }
    }

    fn build_record_field(name: &str, schema: AvroSchema) -> RecordField {
        RecordField {
            name: name.into(),
            schema: schema,
        }
    }

    fn get_test_avro_message() -> String {
        r#"{
            "body": {
              "TopLevel": {
                "status": {
                  "current": {
                    "StatusHistoryDetail": {
                      "statusDetails": {
                        "StatusDetails": {
                          "newStatus": null
                        }
                      },
                      "statusOfGroup": "Live"
                    }
                  },
                  "fullHistory": [{
                    "statusDetails": {
                      "StatusDetails": {
                        "newStatus": null,
                      }
                    },
                    "statusOfGroup": "Live"
                  }]
                }
              }
            }
          }"#
        .to_string()
    }
    fn get_test_avro_schema() -> String {
        r#"{
            "fields": [
              {
                "name": "body",
                "type": [
                  {
                    "fields": [
                      {
                        "name": "id",
                        "type": "string"
                      }
                    ],
                    "name": "Deleted",
                    "type": "record"
                  },
                  {
                    "fields": [
                      {
                        "name": "status",
                        "type": {
                          "fields": [
                            {
                              "name": "current",
                              "type": [
                                "null",
                                {
                                  "fields": [
                                    {
                                      "name": "statusOfGroup",
                                      "type": "string"
                                    },
                                    {
                                      "name": "statusDetails",
                                      "type": [
                                        "null",
                                        {
                                          "fields": [
                                            {
                                              "name": "newStatus",
                                              "type": ["null", "string"]
                                            }
                                          ],
                                          "name": "StatusDetails",
                                          "type": "record"
                                        }
                                      ]
                                    }
                                  ],
                                  "name": "StatusHistoryDetail",
                                  "type": "record"
                                }
                              ]
                            },
                            {
                              "name": "fullHistory",
                              "type": {
                                "items": "StatusHistoryDetail",
                                "type": "array"
                              }
                            }
                          ],
                          "name": "StatusSnapshot",
                          "namespace": "com.test.status",
                          "type": "record"
                        }
                      }
                    ],
                    "name": "TopLevel",
                    "type": "record"
                  }
                ]
              }
            ],
            "name": "Sample",
            "namespace": "com.test",
            "type": "record"
          }"#
        .to_string()
    }
}
