use std::io::Cursor;

use apache_avro::{ from_avro_datum, types::Value as AvroValue, Schema };
use serde_json::{ Map, Value as JsonValue };

use crate::lib::{ schema_registry::SchemaRegistryClient, error::{ Result, Error } };

pub struct AvroParser {
    schema_registry_client: Box<dyn SchemaRegistryClient + Send + Sync>,
}

impl AvroParser {
    pub fn new(client: impl SchemaRegistryClient + Send + Sync + 'static) -> AvroParser {
        AvroParser {
            schema_registry_client: Box::new(client),
        }
    }

    pub async fn parse_payload(&self, raw: &[u8]) -> Result<String> {
        if raw.len() <= 5 || raw[0] != 0x00 {
            return Err(Error::AvroParse {
                message: "Supported avro messages should start with 0x00 follow by the schema id (4 bytes)".into(),
            });
        }

        let id = get_schema_id(raw)?;

        let raw_schema = self.schema_registry_client.get_schema_by_id(id).await.map_err(|err| Error::AvroParse {
            message: format!("{}\n{}", "Unable to retrieve the schema from schema registry", err.to_string()),
        })?;
        let schema = Schema::parse_str(raw_schema.as_str()).map_err(|err| Error::AvroParse {
            message: format!("{}\n{}", "Unable to parse the schema from schema registry", err),
        })?;
        let mut data = Cursor::new(&raw[5..]);
        let record = from_avro_datum(&schema, &mut data, None).map_err(|err| Error::AvroParse {
            message: format!("{}\n{}", "Unable to parse the avro record", err),
        })?;
        let json = map(&record)?;
        let res = serde_json::to_string(&json).map_err(|err| Error::AvroParse {
            message: format!("{}\n{}", "Unable to map the avro record to json", err),
        })?; // todo: maybe pretty_print
        Ok(res)
    }
}

fn get_schema_id(raw: &[u8]) -> Result<i32> {
    let arr = <[u8; 4]>::try_from(&raw[1..5]).map_err(|_| Error::AvroParse {
        message: "Invalid record. Unable to extract the schema id.".into(),
    })?;
    Ok(i32::from_be_bytes(arr))
}

fn map(a: &AvroValue) -> Result<JsonValue> {
    match a {
        AvroValue::Null => Ok(JsonValue::Null),
        AvroValue::Boolean(v) => Ok(JsonValue::Bool(*v)),
        AvroValue::Int(v) => Ok(JsonValue::Number(serde_json::Number::from(*v))),
        AvroValue::Long(v) => Ok(JsonValue::Number(serde_json::Number::from(*v))),
        AvroValue::Float(_v) => todo!(),
        AvroValue::Double(_v) => todo!(),
        AvroValue::Bytes(_) => todo!(),
        AvroValue::String(v) => Ok(JsonValue::String(v.clone())),
        AvroValue::Fixed(_, _) => todo!(),
        AvroValue::Enum(_, _) => todo!(),
        AvroValue::Union(_, v) => map(&**v),
        AvroValue::Array(_) => todo!(),
        AvroValue::Map(vec) => {
            //todo: DRY
            let mut json_map = Map::new();
            for (k, v) in vec.iter() {
                json_map.insert(k.clone(), map(v)?);
            }
            Ok(JsonValue::Object(json_map))
        }
        AvroValue::Record(vec) => {
            let mut json_map = Map::new();
            for (k, v) in vec.iter() {
                json_map.insert(k.clone(), map(v)?);
            }
            Ok(JsonValue::Object(json_map))
        }
        AvroValue::Date(_) => todo!(),
        AvroValue::Decimal(_) => todo!(),
        AvroValue::TimeMillis(_) => todo!(),
        AvroValue::TimeMicros(_) => todo!(),
        AvroValue::TimestampMillis(_) => todo!(),
        AvroValue::TimestampMicros(_) => todo!(),
        AvroValue::Duration(_) => todo!(),
        AvroValue::Uuid(_) => todo!(),
    }
}

// #[cfg(test)]
// mod tests {
//     use apache_avro::{to_avro_datum, types::Record, Schema, Writer};

//     use super::get_schema_id;

//     #[test]
//     fn poc_avro() {
//         let raw_schema = r#"
//     {
//         "doc": "Sample schema to help you get started.",
//         "fields": [
//           {
//             "doc": "The int type is a 32-bit signed integer.",
//             "name": "my_field1",
//             "type": "int"
//           }
//         ],
//         "name": "sampleRecord",
//         "namespace": "com.mycorp.mynamespace",
//         "type": "record"
//       }
// "#;
//         let schema = Schema::parse_str(raw_schema).unwrap();
//         let writer = Writer::new(&schema, Vec::new());
//         let mut record = Record::new(writer.schema()).unwrap();
//         record.put("my_field1", 123);
//         let mut encoded = to_avro_datum(&schema, record).unwrap();
//         // add 1 magic byte + 4 id bytes
//         let mut with_header: Vec<u8> = vec![0x00, 0x00, 0x00, 0x00, 0x00];
//         with_header.append(&mut encoded);
//         //let res = parse_avro(&with_header[..], &schema).unwrap();
//         // [0, 0, 1, 134, 197, 246, 1]
//         // [0, 1, 134, 197] -> 0x01, 0x86, 0xC5 -> 100037
//         // [0, 0, 0, 0, 246, 1]
//         //assert_eq!(res, r#"{"my_field1":123}"#)
//     }

//     #[test]
//     fn u8_array_to_i32() {
//         let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
//         let id = get_schema_id(&raw).unwrap();
//         assert_eq!(id, 100037)
//     }
// }