use rdkafka::{ message::OwnedMessage, Message };
use super::state::{ KafkaRecord };
use crate::error::{ Result, TauriError };

pub(super) fn parse_record(msg: OwnedMessage) -> Result<KafkaRecord> {
    Ok(KafkaRecord {
        key: parse_string(msg.key()),
        value: parse_string(msg.payload()),
    })
}

fn parse_string(v: Option<&[u8]>) -> Option<String> {
    v.map(|v| String::from_utf8_lossy(v).into_owned())
}

#[test]
fn parse_empty_array_to_string() {
    let vec = vec![];
    let res = parse_string(Some(&vec));
    assert_eq!(res, Some("".into()))
}
#[test]
fn parse_none_to_string() {
    let res = parse_string(None);
    assert_eq!(res, None)
}

#[test]
fn parse_invalid_to_string() {
    let vec: Vec<u8> = vec![0x00, 0xff];
    let res = parse_string(Some(&vec));
    assert_eq!(res.is_some(), true)
}