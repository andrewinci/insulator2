use std::collections::{BTreeMap, HashMap};

use apache_avro::{schema::Name, Schema};

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
        let references = extract_all_refs(schema);

        fn map(s: &Schema, parent_ns: &Option<String>, references: &HashMap<Name, Schema>) -> AvroSchema {
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
                Schema::Ref { name } => references
                    .get(&name.fully_qualified_name(parent_ns))
                    .map(|s| map(s, parent_ns, references))
                    .unwrap(),
            }
        }

        Self {
            id,
            schema: map(schema, &None, &references),
            inner_schema: schema.clone(),
        }
    }
}

fn extract_all_refs(s: &Schema) -> HashMap<Name, Schema> {
    // set the namespace of the parent if it's not specified
    fn ns_name(name: &Name, parent_ns: &Option<String>) -> Name {
        Name {
            namespace: name.namespace.clone().or_else(|| parent_ns.to_owned()),
            name: name.name.clone(),
        }
    }
    fn _extract(s: &Schema, parent_ns: &Option<String>, cache: &mut HashMap<Name, Schema>) {
        match s {
            Schema::Array(s) => _extract(s, parent_ns, cache),
            Schema::Map(s) => _extract(s, parent_ns, cache),
            Schema::Union(s) => s.variants().iter().for_each(|s| _extract(s, parent_ns, cache)),
            Schema::Record { name, fields, .. } => {
                let parent = name.namespace.clone().or_else(|| parent_ns.to_owned());
                fields.iter().for_each(|f| _extract(&f.schema, &parent, cache));
                cache.insert(ns_name(name, parent_ns), s.clone());
            }
            Schema::Enum { name, .. } => {
                cache.insert(ns_name(name, parent_ns), s.clone());
            }
            Schema::Fixed { name, .. } => {
                cache.insert(ns_name(name, parent_ns), s.clone());
            }
            _ => (),
        }
    }
    let mut cache = HashMap::new();
    _extract(s, &None, &mut cache);
    cache
}
#[cfg(test)]
mod tests {

    use super::ResolvedAvroSchema;
    use std::{collections::HashSet, fs};

    use apache_avro::{schema::Name, Schema};

    use super::extract_all_refs;

    #[test]
    fn test_parse_schema_with_references() {
        let test_schema = fs::read_to_string("src/lib/avro/test_schemas/multiple_refs.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        // should not panic
        ResolvedAvroSchema::from(123, &schema);
    }

    #[test]
    fn test_extract_all_refs_different_ns() {
        let test_schema = fs::read_to_string("src/lib/avro/test_schemas/ref_to_another_ns.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        let res = extract_all_refs(&schema);
        // assert
        let names: HashSet<_> = res.keys().map(|n| n.to_owned()).collect();
        assert!(names.contains(&name("testTarget", Some("nested.ns"))));
    }

    #[test]
    fn test_extract_all_refs() {
        let test_schema = fs::read_to_string("src/lib/avro/test_schemas/schema.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        let res = extract_all_refs(&schema);
        // assert
        let names: HashSet<_> = res.keys().map(|n| n.to_owned()).collect();
        assert_eq!(
            names,
            HashSet::from_iter(vec![
                name("userInfo1", Some("my.example")),
                name("userInfo2", Some("my.example")),
                name("userInfo3", Some("my.nested")),
                name("userInfo4", Some("my.nested")),
                name("Suit", Some("my.nested")),
                name("userInfo5", Some("my.example")),
                name("userInfo6", Some("my.example")),
                name("Suit", Some("my.example"))
            ])
        );
    }

    fn name(n: &str, ns: Option<&str>) -> Name {
        Name {
            name: n.into(),
            namespace: ns.map(|s| s.to_string()),
        }
    }
}
