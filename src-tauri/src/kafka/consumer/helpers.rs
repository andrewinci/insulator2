use rdkafka::{ message::OwnedMessage, Message };
use serde::{ Serialize, Deserialize };
use tauri::{ AppHandle, Manager };

use super::state::{ ConsumerInfo, KafkaRecord };

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Event {
    consumer: ConsumerInfo,
    records_count: usize,
}

pub(super) async fn notify_client(
    records_count: usize,
    app: &AppHandle,
    consumer_info: &ConsumerInfo
) {
    app.app_handle()
        .emit_all(format!("consumer_{}", consumer_info.topic.clone()).as_str(), Event {
            consumer: consumer_info.clone(),
            records_count,
        })
        .expect("unable to send a notification to the frontend");
}

pub(super) fn parse_record(msg: OwnedMessage) -> std::result::Result<KafkaRecord, String> {
    Ok(KafkaRecord {
        key: parse_string(msg.key()).map_err(|_| "Unable to map the key")?,
        value: parse_string(msg.payload()).map_err(|_| "Unable to map the value")?,
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