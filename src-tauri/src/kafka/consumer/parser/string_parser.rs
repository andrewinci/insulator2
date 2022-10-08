use futures::FutureExt;
use rdkafka::{ message::OwnedMessage, Message };
use crate::kafka::{ error::Result, consumer::types::KafkaRecord };

use super::RecordParser;

pub struct StringParser;
impl StringParser {
    pub fn new() -> StringParser {
        StringParser {}
    }
}
impl RecordParser for StringParser {
    fn parse_record(&self, msg: OwnedMessage) -> futures::future::BoxFuture<Result<KafkaRecord>> {
        (
            async move {
                Ok(KafkaRecord {
                    key: parse_string(msg.key()),
                    value: parse_string(msg.payload()),
                    offset: msg.offset(),
                    partition: msg.partition(),
                    timestamp: match msg.timestamp() {
                        rdkafka::Timestamp::NotAvailable => None,
                        rdkafka::Timestamp::CreateTime(t) => Some(t),
                        rdkafka::Timestamp::LogAppendTime(t) => Some(t),
                    },
                })
            }
        ).boxed()
    }
}

pub fn parse_string(v: Option<&[u8]>) -> Option<String> {
    v.map(|v| String::from_utf8_lossy(v).into_owned())
}

#[cfg(test)]
mod tests {
    use super::parse_string;

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
}