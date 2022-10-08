use futures::future::BoxFuture;
use rdkafka::message::OwnedMessage;

use crate::kafka::{ consumer::types::KafkaRecord, error::Result };

pub trait RecordParser {
    fn parse_record(&self, msg: OwnedMessage) -> BoxFuture<Result<KafkaRecord>>;
}