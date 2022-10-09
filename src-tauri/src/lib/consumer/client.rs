use async_trait::async_trait;

#[async_trait]
pub trait Consumer {}

pub struct KafkaConsumer {}
impl KafkaConsumer {
    pub fn new() -> KafkaConsumer {
        KafkaConsumer {}
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {}