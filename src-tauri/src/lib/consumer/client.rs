use async_trait::async_trait;
use crate::lib::{ error::Result, types::RawKafkaRecord };
use super::types::{ ConsumerOffsetConfiguration, ConsumerState };

#[async_trait]
pub trait Consumer {
    async fn start(&self, topic: &str, offset_config: ConsumerOffsetConfiguration) -> Result<()>;
    async fn stop(&self) -> Result<()>;
    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord>;
    async fn get_consumer_state(&self) -> ConsumerState;
}

pub struct KafkaConsumer {}
impl KafkaConsumer {
    pub fn new() -> KafkaConsumer {
        KafkaConsumer {}
    }
}

#[async_trait]
impl Consumer for KafkaConsumer {
    async fn start(&self, topic: &str, offset_config: ConsumerOffsetConfiguration) -> Result<()> {
        todo!()
    }
    async fn stop(&self) -> Result<()> {
        todo!()
    }
    async fn get_record(&self, index: usize) -> Option<RawKafkaRecord> {
        todo!()
    }
    async fn get_consumer_state(&self) -> ConsumerState {
        todo!()
    }
}