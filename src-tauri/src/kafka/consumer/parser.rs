use rdkafka::{ message::OwnedMessage, Message };
use super::state::{ KafkaRecord };
use crate::error::{ Result, TauriError };

pub(super) fn parse_record(msg: OwnedMessage) -> Result<KafkaRecord> {
    Ok(KafkaRecord {
        key: parse_string(msg.key()).map_err(|_| parse_error("Unable to map the key".into()))?,
        value: parse_string(msg.payload()).map_err(|_| parse_error("Unable to map the value".into()))?,
    })
}

fn parse_string(v: Option<&[u8]>) -> std::result::Result<Option<String>, String> {
    match v {
        Some(v) =>
            String::from_utf8(Vec::from(v))
                .map(Some)
                .map_err(|_| "unable to parse the string to utf8".into()),
        None => Ok(None),
    }
}

fn parse_error(message: String) -> TauriError {
    TauriError {
        error_type: "Record parsing error".into(),
        message,
    }
}

#[test]
fn parse_empty_array_to_string() {
    let vec = vec![];
    let res = parse_string(Some(&vec));
    assert_eq!(res, Ok(Some("".into())))
}
#[test]
fn parse_none_to_string() {
    let res = parse_string(None);
    assert_eq!(res, Ok(None))
}

#[test]
fn parse_invalid_to_string() {
    let vec: Vec<u8> = vec![0x00, 0xff];
    let res = parse_string(Some(&vec));
    assert_eq!(res, Err("unable to parse the string to utf8".into()))
}