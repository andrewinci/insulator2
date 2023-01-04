use std::collections::HashMap;

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
    Record { name: Name, fields: Vec<RecordField> },
    Enum { name: Name, symbols: Vec<String> },
    Fixed { name: Name, size: usize },
    Decimal { precision: usize, scale: usize },
}

#[derive(Clone, Debug, PartialEq)]
pub struct ResolvedAvroSchema {
    pub id: i32,
    pub schema: AvroSchema,
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
                Schema::Record { name, fields, .. } => AvroSchema::Record {
                    name: name.clone(),
                    fields: fields
                        .iter()
                        .map(|i| RecordField {
                            name: i.name.clone(),
                            schema: map(&i.schema, &name.namespace.clone().or(parent_ns.clone()), references),
                        })
                        .collect(),
                },
                Schema::Enum { name, symbols, .. } => AvroSchema::Enum {
                    name: name.clone(),
                    symbols: symbols.clone(),
                },
                Schema::Fixed { name, size, .. } => AvroSchema::Fixed {
                    name: name.clone(),
                    size: size.clone(),
                },
                Schema::Decimal { precision, scale, .. } => AvroSchema::Decimal {
                    precision: precision.clone(),
                    scale: scale.clone(),
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
