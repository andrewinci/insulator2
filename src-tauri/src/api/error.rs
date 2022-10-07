use crate::kafka::error::Error as KafkaError;
use serde::{ Deserialize, Serialize };
pub type Result<T> = std::result::Result<T, TauriError>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TauriError {
    #[serde(rename = "errorType")]
    pub error_type: String,
    pub message: String,
}

impl From<KafkaError> for TauriError {
    fn from(error: KafkaError) -> Self {
        match error {
            KafkaError::GenericKafka { msg } =>
                TauriError {
                    error_type: "Generic Kafka Error".into(),
                    message: msg,
                },
            KafkaError::KafkaConsumer { msg } =>
                TauriError {
                    error_type: "Kafka Consumer Error".into(),
                    message: msg,
                },
            KafkaError::AvroParse { msg } =>
                TauriError {
                    error_type: "Avro Parse Error".into(),
                    message: msg,
                },
        }
    }
}