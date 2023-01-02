use rdkafka::{error::KafkaError, types::RDKafkaErrorCode};

use crate::lib::LibError;

#[derive(Debug)]
pub enum AdminError {
    /// topic (Name) not found
    TopicNotFound(String),
    /// RDKafka errors
    RDKafka(String),
    // Lib errors
    ConsumerError(LibError),
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
impl From<LibError> for AdminError {
    fn from(value: LibError) -> Self {
        AdminError::ConsumerError(value)
    }
}
