use crate::lib::{schema_registry::SchemaRegistryError, LibError};
use serde::{Deserialize, Serialize};

pub type ApiResult<T> = std::result::Result<T, ApiError>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiError {
    #[serde(rename = "errorType")]
    pub error_type: String,
    pub message: String,
}

impl From<LibError> for ApiError {
    fn from(err: LibError) -> Self {
        let (error_type, message) = match err {
            LibError::Generic { message } => ("Generic error", message),
            LibError::AvroParse { message } => ("Avro parser error", message),
            LibError::IO { message } => ("IO error", message),
            LibError::JSONSerde { message } => ("JSON Serde error", message),
            LibError::Consumer { message } => ("Kafka Consumer error", message),
            LibError::Kafka { message } => ("Kafka error", message),
            LibError::SqlError { message } => ("SQLite error", message),
            LibError::LegacyConfiguration { message } => ("Import legacy config error", message),
            LibError::TOMLSerde { message } => ("TOML Serde error", message),
        };
        ApiError {
            error_type: error_type.into(),
            message,
        }
    }
}

impl From<SchemaRegistryError> for ApiError {
    fn from(err: SchemaRegistryError) -> Self {
        ApiError {
            error_type: "Schema registry error".into(),
            message: match err {
                SchemaRegistryError::HttpClient { message: msg } => msg,
                SchemaRegistryError::InvalidUrl => "Invalid url".into(),
                SchemaRegistryError::SchemaParsing { message: msg } => msg,
                SchemaRegistryError::SchemaNotFound { message } => message,
            },
        }
    }
}
