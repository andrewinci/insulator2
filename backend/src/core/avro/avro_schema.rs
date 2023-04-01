use std::collections::{BTreeMap, HashMap};

use apache_avro::{
    schema::{Name, ResolvedSchema},
    Schema,
};

#[derive(Clone, Debug, PartialEq)]
pub struct RecordField {
    pub name: String,
    pub schema: AvroSchema,
}

/// Avro schema without references
#[derive(Clone, Debug, PartialEq)]
pub enum AvroSchema {
    Null,
    Boolean,
    Int,
    Long,
    Float,
    Double,
    Bytes,
    String,
    Uuid,
    Date,
    TimeMillis,
    TimeMicros,
    TimestampMillis,
    TimestampMicros,
    Duration,
    Array(Box<AvroSchema>),
    Map(Box<AvroSchema>),
    Union(Vec<AvroSchema>),
    Record {
        name: Name,
        fields: Vec<RecordField>,
        lookup: BTreeMap<String, usize>,
    },
    Enum {
        name: Name,
        symbols: Vec<String>,
    },
    Fixed {
        name: Name,
        size: usize,
    },
    Decimal {
        precision: usize,
        scale: usize,
    },
}

impl AvroSchema {
    pub fn fqn(&self) -> String {
        fn fqn(name: Name) -> String {
            match name.namespace {
                Some(namespace) => format!("{}.{}", namespace, name.name),
                None => name.name,
            }
        }
        match self {
            AvroSchema::Null => "null".into(),
            AvroSchema::Boolean => "boolean".into(),
            AvroSchema::Int => "int".into(),
            AvroSchema::Long => "long".into(),
            AvroSchema::Float => "float".into(),
            AvroSchema::Double => "double".into(),
            AvroSchema::Bytes => "bytes".into(),
            AvroSchema::String => "string".into(),
            AvroSchema::Record { name, .. } => fqn(name.clone()),
            AvroSchema::Enum { name, .. } => fqn(name.clone()),
            AvroSchema::Uuid => "uuid".into(),
            AvroSchema::Date => "date".into(),
            AvroSchema::TimeMillis => "time-millis".into(),
            AvroSchema::TimeMicros => "time-micros".into(),
            AvroSchema::TimestampMillis => "timestamp-millis".into(),
            AvroSchema::TimestampMicros => "timestamp-micros".into(),
            AvroSchema::Decimal { .. } => "decimal".into(),
            AvroSchema::Duration => "duration".into(),
            AvroSchema::Array(_) => "array".into(),
            AvroSchema::Map(_) => "map".into(),
            AvroSchema::Union(_) => "union".into(),
            AvroSchema::Fixed { .. } => "fixed".into(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ResolvedAvroSchema {
    pub id: i32,
    pub schema: AvroSchema,
    pub inner_schema: Schema,
}

impl ResolvedAvroSchema {
    pub fn from(id: i32, schema: &Schema) -> Self {
        let resolved_schema = ResolvedSchema::try_from(schema).unwrap();
        let references = resolved_schema.get_names();

        fn map(s: &Schema, parent_ns: &Option<String>, references: &HashMap<Name, &Schema>) -> AvroSchema {
            match s {
                Schema::Null => AvroSchema::Null,
                Schema::Boolean => AvroSchema::Boolean,
                Schema::Int => AvroSchema::Int,
                Schema::Long => AvroSchema::Long,
                Schema::Float => AvroSchema::Float,
                Schema::Double => AvroSchema::Double,
                Schema::Bytes => AvroSchema::Bytes,
                Schema::String => AvroSchema::String,
                Schema::Uuid => AvroSchema::Uuid,
                Schema::Date => AvroSchema::Date,
                Schema::TimeMillis => AvroSchema::TimeMillis,
                Schema::TimeMicros => AvroSchema::TimeMicros,
                Schema::TimestampMillis => AvroSchema::TimestampMillis,
                Schema::TimestampMicros => AvroSchema::TimestampMicros,
                Schema::Duration => AvroSchema::Duration,
                Schema::Array(s) => AvroSchema::Array(Box::new(map(s, parent_ns, references))),
                Schema::Map(s) => AvroSchema::Map(Box::new(map(s, parent_ns, references))),
                Schema::Union(s) => {
                    AvroSchema::Union(s.variants().iter().map(|s| map(s, parent_ns, references)).collect())
                }
                Schema::Record {
                    name, fields, lookup, ..
                } => AvroSchema::Record {
                    name: name.clone(),
                    lookup: lookup.clone(),
                    fields: fields
                        .iter()
                        .map(|i| RecordField {
                            name: i.name.clone(),
                            schema: map(
                                &i.schema,
                                &name.namespace.clone().or_else(|| parent_ns.clone()),
                                references,
                            ),
                        })
                        .collect(),
                },
                Schema::Enum { name, symbols, .. } => AvroSchema::Enum {
                    name: name.clone(),
                    symbols: symbols.clone(),
                },
                Schema::Fixed { name, size, .. } => AvroSchema::Fixed {
                    name: name.clone(),
                    size: *size,
                },
                Schema::Decimal { precision, scale, .. } => AvroSchema::Decimal {
                    precision: *precision,
                    scale: *scale,
                },
                Schema::Ref { name } => {
                    let fqn = name.fully_qualified_name(parent_ns);
                    let schema = references
                        .get(&fqn)
                        .expect(format!("Unable to resolve {fqn:?}.").as_str());
                    map(schema, &fqn.namespace, references)
                }
            }
        }

        Self {
            id,
            schema: map(schema, &None, &references),
            inner_schema: schema.clone(),
        }
    }
}

#[cfg(test)]
mod tests {

    use super::ResolvedAvroSchema;
    use std::fs;

    use apache_avro::Schema;

    #[test]
    fn test_parse_schema_with_enum() {
        let test_schema = fs::read_to_string("src/core/avro/test_schemas/nested_refs.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        // should not panic
        ResolvedAvroSchema::from(123, &schema);
    }

    #[test]
    fn test_parse_schema_with_references() {
        let test_schema = fs::read_to_string("src/core/avro/test_schemas/multiple_refs.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        // should not panic
        ResolvedAvroSchema::from(123, &schema);
    }
}
