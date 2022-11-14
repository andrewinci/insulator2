use crate::lib::{schema_registry::SchemaRegistryError, Error};
use serde::{Deserialize, Serialize};
pub type Result<T> = std::result::Result<T, TauriError>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TauriError {
    #[serde(rename = "errorType")]
    pub error_type: String,
    pub message: String,
}

impl From<Error> for TauriError {
    fn from(err: Error) -> Self {
        let (error_type, message) = match err {
            Error::AvroParse { message } => ("Avro parser error", message),
            Error::IO { message } => ("IO error", message),
            Error::JSONSerde { message } => ("JSON Serde error", message),
            Error::Consumer { message } => ("Kafka Consumer error", message),
            Error::Kafka { message } => ("Kafka error", message),
            Error::SqlError { message } => ("SQLite error", message),
            Error::LegacyConfig { message } => ("Import legacy config error", message),
        };
        TauriError {
            error_type: error_type.into(),
            message,
        }
    }
}

impl From<SchemaRegistryError> for TauriError {
    fn from(err: SchemaRegistryError) -> Self {
        TauriError {
            error_type: "Schema registry error".into(),
            message: match err {
                SchemaRegistryError::HttpClient { message: msg } => msg,
                SchemaRegistryError::InvalidUrl => "Invalid url".into(),
                SchemaRegistryError::SchemaParsing { message: msg } => msg,
            },
        }
    }
}
