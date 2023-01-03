use std::{collections::HashMap, str::FromStr};

use apache_avro::{schema::Name, to_avro_datum, types::Value as AvroValue, Schema};
use log::error;

use super::{
    avro_parser::AvroParser,
    error::AvroResult,
    helpers::{build_record_header, get_schema_name},
    schema_provider::SchemaProvider,
    AvroError,
};
use crate::lib::schema_registry::ResolvedAvroSchema;
use serde_json::Value as JsonValue;

impl<S: SchemaProvider> AvroParser<S> {
    pub async fn json_to_avro(&self, json: &str, schema_name: &str) -> AvroResult<Vec<u8>> {
        let schema = self.schema_provider.get_schema_by_name(schema_name).await?;
        Self::json_to_avro_with_schema(self, json, schema)
    }

    pub fn json_to_avro_with_schema(&self, json: &str, schema: ResolvedAvroSchema) -> AvroResult<Vec<u8>> {
        let json_value = JsonValue::from_str(json).map_err(|err| AvroError::ParseJsonValue(err.to_string()))?;
        let mut res = build_record_header(schema.schema_id);
        let avro_value = json_to_avro_map(&json_value, &schema.schema, &schema.resolved_schemas)?;
        let mut avro_record = to_avro_datum(&schema.schema, avro_value.clone()).map_err(|err| {
            error!(
                "\n\tUnable to parse {:?}\n\tUsing schema: {:?}\n\tError: {:?}",
                avro_value, &schema.schema, err
            );
            AvroError::ParseAvroValue(err.to_string())
        })?;
        res.append(&mut avro_record);
        Ok(res)
    }
}

fn json_to_avro_map(j: &JsonValue, s: &Schema, ref_map: &HashMap<Name, Schema>) -> AvroResult<AvroValue> {
    match (&s, j) {
        // complex types
        (Schema::Record { fields, .. }, JsonValue::Object(obj)) => map_json_fields_to_record(fields, obj, ref_map),
        (Schema::Array(items_schema), JsonValue::Array(values)) => map_json_array_to_avro(values, items_schema, ref_map),
        (Schema::Union(union_schema), JsonValue::Null) => {
            let (position, _) = union_schema.find_schema(&AvroValue::Null).ok_or_else(|| {
                AvroError::InvalidUnion(format!(
                    "Cannot set null to the union. Supported options are: {:?}",
                    union_schema.variants()
                ))
            })?;
            Ok(AvroValue::Union(position as u32, AvroValue::Null.into()))
        }
        (Schema::Union(union_schema), JsonValue::Object(obj)) => map_union(obj, union_schema, ref_map),
        (Schema::Map(schema), JsonValue::Object(obj)) => {
            let mut avro_map = HashMap::new();
            for (key, value) in obj {
                avro_map.insert(key.to_string(), json_to_avro_map(value, schema, ref_map)?);
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
                .ok_or_else(|| AvroError::InvalidEnum(format!("Invalid enum {} expected one of {:?}", s, symbols)))?;
            Ok(AvroValue::Enum(index as u32, value.into()))
        }
        // numbers
        (Schema::Int, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .and_then(|v| i32::try_from(v).ok())
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {} to Int", n)))?;
            Ok(AvroValue::Int(n))
        }
        (Schema::Long, JsonValue::Number(n)) => {
            let n = n
                .as_i64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {} to Long", n)))?;
            Ok(AvroValue::Long(n))
        }
        (Schema::Float, JsonValue::Number(n)) => {
            let n = n
                .as_f64()
                .map(|v| v as f32)
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {} to Float", n)))?;
            Ok(AvroValue::Float(n))
        }
        (Schema::Double, JsonValue::Number(n)) => {
            let n = n
                .as_f64()
                .ok_or_else(|| AvroError::InvalidNumber(format!("Unable to convert {} to Double", n)))?;
            Ok(AvroValue::Double(n))
        }
        (Schema::Ref { name }, value) => {
            let schema = ref_map
                .get(name)
                .ok_or_else(|| AvroError::MissingAvroSchemaReference(format!("Unable to resolve reference {}", name)))?;
            json_to_avro_map(value, schema, ref_map)
        }
        // (
        //     Schema::Decimal {
        //         precision,
        //         scale,
        //         inner,
        //     },
        //     JsonValue::Number(n),
        // ) => todo!(),

        // Schema::Fixed { name, aliases, doc, size } => todo!(),
        // Schema::Uuid => todo!(),
        // // time
        // Schema::Date => todo!(),
        // Schema::TimeMillis => todo!(),
        // Schema::TimeMicros => todo!(),
        // Schema::TimestampMillis => todo!(),
        // Schema::TimestampMicros => todo!(),
        // Schema::Duration => todo!(),
        // todo:
        //(Schema::Bytes, JsonValue::String(s)) => todo!(),
        (schema, value) => Err(AvroError::Unsupported(format!(
            "Unsupported Schema-JsonValue tuple: \n\n{:?}\n\n{:?}",
            schema, value
        ))),
    }
}

fn map_union(
    obj: &serde_json::Map<String, JsonValue>,
    union_schema: &apache_avro::schema::UnionSchema,
    ref_map: &HashMap<Name, Schema>,
) -> Result<AvroValue, AvroError> {
    let fields_vec: Vec<(&String, &JsonValue)> = obj.iter().collect();
    if fields_vec.len() != 1 {
        Err(AvroError::InvalidUnion(format!(
            "Invalid union. Expected one of: {:?}",
            union_schema.variants()
        )))
    } else {
        let (union_branch_name, value) = *fields_vec.first().unwrap();
        let index_schema = union_schema
            .variants()
            .iter()
            .enumerate()
            .find(|(_, s)| get_schema_name(s).eq(union_branch_name));
        if let Some((index, current_schema)) = index_schema {
            let value = json_to_avro_map(value, current_schema, ref_map)?;
            Ok(AvroValue::Union(index as u32, value.into()))
        } else {
            Err(AvroError::InvalidUnion(format!(
                "Unsupported union specifier: {}",
                union_branch_name
            )))
        }
    }
}

fn map_json_array_to_avro(
    values: &Vec<JsonValue>,
    items_schema: &Schema,
    ref_map: &HashMap<Name, Schema>,
) -> Result<AvroValue, AvroError> {
    let mut vec = vec![];
    for value in values {
        let avro_value = json_to_avro_map(value, items_schema, ref_map)?;
        vec.push(avro_value);
    }
    Ok(AvroValue::Array(vec))
}

fn map_json_fields_to_record(
    fields: &Vec<apache_avro::schema::RecordField>,
    obj: &serde_json::Map<String, JsonValue>,
    ref_map: &HashMap<Name, Schema>,
) -> Result<AvroValue, AvroError> {
    let mut record_fields: Vec<(String, AvroValue)> = vec![];
    for field in fields {
        let field_value = obj
            .get(&field.name)
            .ok_or_else(|| AvroError::MissingField(field.name.clone()))?;
        let avro_field = json_to_avro_map(field_value, &field.schema, ref_map)?;
        record_fields.push((field.name.clone(), avro_field));
    }
    Ok(AvroValue::Record(record_fields))
}

#[cfg(test)]
mod tests {

    use std::collections::BTreeMap;
    use std::collections::HashMap;

    use apache_avro::{schema::RecordField, Schema};

    use super::map_json_fields_to_record;
    use crate::lib::avro::AvroError;

    use apache_avro::types::Value as AvroValue;
    use serde_json::json;
    use serde_json::Value as JsonValue;

    #[test]
    fn test_map_record() {
        let obj = {
            let mut obj_map = serde_json::Map::new();
            obj_map.insert("sample".to_string(), json!(1));
            obj_map
        };
        let fields = vec![build_record_field("sample", apache_avro::Schema::Int)];

        // happy path
        {
            let res = map_json_fields_to_record(&fields, &obj, &HashMap::new());
            assert_eq!(
                res,
                Ok(AvroValue::Record(vec![("sample".to_string(), AvroValue::Int(1))]))
            );
        }

        // parse a json object with a missing field return an error
        {
            let fields = vec![
                build_record_field("sample", apache_avro::Schema::Int),
                build_record_field("sample_2", apache_avro::Schema::Int),
            ];
            let res = map_json_fields_to_record(&fields, &obj, &HashMap::new());
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
            let nested_schema = Schema::Record {
                name: "Nested".into(),
                aliases: None,
                doc: None,
                fields: fields,
                lookup: BTreeMap::<String, usize>::new(),
            };
            let fields = vec![
                build_record_field("sample", apache_avro::Schema::Int),
                build_record_field("nested", nested_schema),
            ];
            let res = map_json_fields_to_record(&fields, &obj_parent, &HashMap::new());
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

    fn build_record_field(name: &str, schema: Schema) -> RecordField {
        RecordField {
            name: name.into(),
            doc: Default::default(),
            default: Default::default(),
            schema: schema,
            order: apache_avro::schema::RecordFieldOrder::Ignore,
            position: Default::default(),
        }
    }
}
