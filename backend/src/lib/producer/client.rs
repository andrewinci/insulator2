use rdkafka::producer::{BaseProducer, BaseRecord};

use crate::lib::{
    configuration::{build_kafka_client_config, ClusterConfig},
    Result,
};

pub struct KafkaProducer {
    producer: BaseProducer,
}

impl KafkaProducer {
    pub fn new(cluster_config: &ClusterConfig) -> Self {
        let producer: BaseProducer = build_kafka_client_config(cluster_config, None)
            .create()
            .expect("Unable to create the consumer"); //todo: bubble up
        Self { producer }
    }
    // Use a None value for tombstones
    pub fn produce(&self, topic: &str, key: &str, value: Option<&str>) -> Result<()> {
        let mut record = BaseRecord::to(topic).key(key);
        if let Some(payload) = value {
            record = record.payload(payload);
        }
        let res = self.producer.send(record).map_err(|err| err.0);
        Ok(res?)
    }
}
