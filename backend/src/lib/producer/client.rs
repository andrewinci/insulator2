use std::sync::Arc;

use rdkafka::producer::{BaseProducer, BaseRecord};

use crate::lib::{
    configuration::{build_kafka_client_config, ClusterConfig},
    parser::Parser,
    types::ParserMode,
    LibResult,
};

use super::record_parser::KafkaRecordParser;

pub struct KafkaProducer<P: KafkaRecordParser = Parser> {
    producer: BaseProducer,
    parser: Arc<P>,
}

impl<P: KafkaRecordParser> KafkaProducer<P> {
    pub fn new(cluster_config: &ClusterConfig, parser: Arc<P>) -> Self {
        let producer: BaseProducer = build_kafka_client_config(cluster_config, None)
            .create()
            .expect("Unable to create the consumer"); //todo: bubble up the error
        Self { producer, parser }
    }
    // Use a None value for tombstones
    pub async fn produce(&self, topic: &str, key: &str, value: Option<&str>, mode: ParserMode) -> LibResult<()> {
        let mut record = BaseRecord::to(topic).key(key);
        let payload = if let Some(payload) = value {
            match mode {
                ParserMode::String => Some(self.parser.parse_to_string(payload)),
                ParserMode::Avro => Some(self.parser.parse_to_avro(payload, topic).await?),
            }
        } else {
            None
        };
        if let Some(value) = payload {
            record = record.payload(&value);
            Ok(self.producer.send(record).map_err(|err| err.0)?)
        } else {
            Ok(self.producer.send(record).map_err(|err| err.0)?)
        }
    }
}
