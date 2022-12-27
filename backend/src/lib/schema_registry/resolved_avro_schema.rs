use std::collections::HashMap;

use apache_avro::{schema::Name, Schema};

use super::types::ResolvedAvroSchema;

impl From<Schema> for ResolvedAvroSchema {
    fn from(schema: Schema) -> Self {
        let refs = extract_all_refs(&schema);
        Self {
            schema,
            resolved_schemas: refs,
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
    use std::{collections::HashSet, fs};

    use apache_avro::{schema::Name, Schema};

    use super::extract_all_refs;

    #[test]
    fn test_extract_all_refs_different_ns() {
        let test_schema = fs::read_to_string("src/lib/schema_registry/avro_test_files/ref_to_another_ns.json").unwrap();
        let schema = Schema::parse_str(&test_schema).unwrap();
        let res = extract_all_refs(&schema);
        // assert
        let names: HashSet<_> = res.keys().map(|n| n.to_owned()).collect();
        assert!(names.contains(&name("testTarget", Some("nested.ns"))));
    }

    #[test]
    fn test_extract_all_refs() {
        let test_schema = fs::read_to_string("src/lib/schema_registry/avro_test_files/schema.json").unwrap();
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
