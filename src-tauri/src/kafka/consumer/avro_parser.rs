use std::io::Cursor;

use apache_avro::{ from_avro_datum, types::Value as AvroValue, Schema };
use rdkafka::{ message::OwnedMessage, Message };
use serde_json::{ Map, Value as JsonValue };

use crate::{
    configuration::SchemaRegistry,
    error::{ Result, TauriError },
    kafka::consumer::KafkaRecord,
    schema_registry::get_schema_internal,
};

use super::string_parser::parse_string;

pub(super) async fn parse_record(msg: OwnedMessage, config: &SchemaRegistry) -> Result<KafkaRecord> {
    let schema: Schema = get_last_schema(msg.topic().to_owned(), config).await?;

    let value = match msg.payload() {
        Some(x) => Some(parse_avro(x, &schema)?),
        None => None,
    };

    Ok(KafkaRecord {
        key: parse_string(msg.key()), //todo: support avro key
        value,
        offset: msg.offset(),
        partition: msg.partition(),
        timestamp: match msg.timestamp() {
            rdkafka::Timestamp::NotAvailable => None,
            rdkafka::Timestamp::CreateTime(t) => Some(t),
            rdkafka::Timestamp::LogAppendTime(t) => Some(t),
        },
    })
}

async fn get_last_schema(topic: String, config: &SchemaRegistry) -> Result<Schema> {
    let subject = format!("{}-value", topic);
    let schema_versions = get_schema_internal(subject, config).await?;
    let last_schema = schema_versions
        .iter()
        .max_by(|a, b| a.version.cmp(&b.version))
        .ok_or(TauriError {
            error_type: "Schema not foud".into(),
            message: format!("Schema for subject {} not found in schema registry", topic),
        })?;
    Schema::parse_str(&last_schema.schema).map_err(|err| TauriError {
        error_type: "Unable to parse the schema".into(),
        message: err.to_string(),
    })
}

pub fn parse_avro(raw: &[u8], schema: &Schema) -> Result<String> {
    //todo: error handling
    //todo: use the schema id (first 4 bytes)
    println!("{:?}", schema);
    println!("{:?}", raw.to_vec());
    let mut data = Cursor::new(&raw[5..]);
    let record = from_avro_datum(schema, &mut data, None).unwrap();
    let json = map(&record)?;
    let res = serde_json::to_string(&json)?; // todo: maybe pretty_print
    Ok(res)
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

#[cfg(test)]
mod tests {
    use apache_avro::{ to_avro_datum, types::Record, Schema, Writer };

    use super::parse_avro;

    #[test]
    fn poc_avro() {
        let raw_schema =
            r#"
    {
        "doc": "Sample schema to help you get started.",
        "fields": [
          {
            "doc": "The int type is a 32-bit signed integer.",
            "name": "my_field1",
            "type": "int"
          }
        ],
        "name": "sampleRecord",
        "namespace": "com.mycorp.mynamespace",
        "type": "record"
      }
"#;
        let schema = Schema::parse_str(raw_schema).unwrap();
        let writer = Writer::new(&schema, Vec::new());
        let mut record = Record::new(writer.schema()).unwrap();
        record.put("my_field1", 123);
        let mut encoded = to_avro_datum(&schema, record).unwrap();
        // add 1 magic byte + 4 id bytes
        let mut with_header: Vec<u8> = vec![0x00, 0x00, 0x00, 0x00, 0x00];
        with_header.append(&mut encoded);
        let res = parse_avro(&with_header[..], &schema).unwrap();
        // [0, 0, 1, 134, 197, 246, 1]
        // [0, 1, 134, 197] -> 0x01, 0x86, 0xC5 -> 100037
        // [0, 0, 0, 0, 246, 1]
        assert_eq!(res, r#"{"my_field1":123}"#)
    }
}