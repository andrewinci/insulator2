use async_trait::async_trait;

#[async_trait]
pub trait Admin {}

pub struct KafkaAdmin {}

#[async_trait]
impl Admin for KafkaAdmin {}

impl KafkaAdmin {
    pub fn new() -> KafkaAdmin {
        KafkaAdmin {}
    }
}