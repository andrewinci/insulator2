use apache_avro::{schema::Name, Schema};
use log::error;

use super::error::{AvroError, AvroResult};

pub(super) fn get_schema_id_from_record_header(raw: &[u8]) -> AvroResult<i32> {
    const AVRO_MAGIC_BYTE: u8 = 0x00;
    if raw.len() <= 5 || raw[0] != AVRO_MAGIC_BYTE {
        return Err(AvroError::InvalidAvroHeader(
            "Supported avro messages should start with 0x00 follow by the schema id (4 bytes)".into(),
        ));
    }
    let arr = <[u8; 4]>::try_from(&raw[1..5])
        .map_err(|_| AvroError::InvalidAvroHeader("Invalid record. Unable to extract the schema id.".into()))?;
    Ok(i32::from_be_bytes(arr))
}

pub(super) fn build_record_header(schema_id: i32) -> Vec<u8> {
    let mut res = vec![0x00];
    let mut id = Vec::from(schema_id.to_be_bytes());
    res.append(&mut id);
    res
}

fn ns_name(name: &Name, parent_ns: Option<&str>) -> String {
    let namespace = name.namespace.clone().or_else(|| parent_ns.map(|n| n.to_string()));
    if let Some(namespace) = namespace {
        format!("{}.{}", namespace, name.name)
    } else {
        name.name.clone()
    }
}

/// retrieve the schema name to be used in Json
pub(super) fn get_schema_name<'a>(s: &'a Schema, parent_ns: Option<&'a str>) -> String {
    match s {
        Schema::Null => "null".into(),
        Schema::Boolean => "boolean".into(),
        Schema::Int => "int".into(),
        Schema::Long => "long".into(),
        Schema::Float => "float".into(),
        Schema::Double => "double".into(),
        Schema::Bytes => "bytes".into(),
        Schema::String => "string".into(),
        Schema::Record { name, .. } => ns_name(name, parent_ns),
        Schema::Enum { name, .. } => ns_name(name, parent_ns),
        Schema::Ref { name, .. } => ns_name(name, parent_ns),
        _ => {
            //todo: support the other types
            let message = format!("Unable to retrieve the name of the schema {:?}", s);
            error!("{}", message);
            panic!("{}", message);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{build_record_header, get_schema_id_from_record_header};

    #[test]
    fn test_get_schema_id_from_raw() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn test_too_short_record_fails() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn test_missing_magic_byte_fails() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn build_record_header_happy_path() {
        let raw = build_record_header(100037);
        assert_eq!(raw, vec![0x00, 0x00, 0x01, 0x86, 0xc5])
    }
}
