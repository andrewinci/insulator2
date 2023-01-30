use rdkafka::{error::KafkaError, types::RDKafkaErrorCode};

use crate::core::consumer::ConsumerError;

#[derive(Debug)]
pub enum AdminError {
    /// topic (Name) not found
    TopicNotFound(String),
    /// RDKafka errors
    RDKafka(String),
    // Consumer error
    ConsumerError(ConsumerError),
}

pub type AdminResult<T> = Result<T, AdminError>;

impl From<KafkaError> for AdminError {
    fn from(error: KafkaError) -> Self {
        AdminError::RDKafka(error.to_string())
    }
}
impl From<RDKafkaErrorCode> for AdminError {
    fn from(value: RDKafkaErrorCode) -> Self {
        AdminError::RDKafka(value.to_string())
    }
}
//todo: change with the consumer error
impl From<ConsumerError> for AdminError {
    fn from(value: ConsumerError) -> Self {
        AdminError::ConsumerError(value)
    }
}
