use rdkafka::error::KafkaError;

#[derive(Debug)]
pub enum ConsumerError {
    RDKafka(String),
    RecordStore(String, crate::lib::record_store::StoreError),
}
pub type ConsumerResult<T> = Result<T, ConsumerError>;

impl From<KafkaError> for ConsumerError {
    fn from(error: KafkaError) -> Self {
        ConsumerError::RDKafka(error.to_string())
    }
}
