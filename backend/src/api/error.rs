use crate::lib::{admin::AdminError, configuration::ConfigError, schema_registry::SchemaRegistryError, LibError};
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

impl From<AdminError> for ApiError {
    fn from(value: AdminError) -> Self {
        match value {
            AdminError::TopicNotFound(topic_name) => ApiError {
                error_type: "Admin client".into(),
                message: format!("Topic {} not found.", topic_name),
            },
            AdminError::RDKafka(message) => ApiError {
                error_type: "RDKafkaLib error".into(),
                message,
            },
            AdminError::ConsumerError(consumer_error) => consumer_error.into(),
        }
    }
}

impl From<ConfigError> for ApiError {
    fn from(value: ConfigError) -> Self {
        match value {
            ConfigError::IO(msg) => ApiError {
                error_type: "IO error handling user configurations".into(),
                message: msg,
            },
            ConfigError::JSONSerde(msg) => ApiError {
                error_type: "JSON error handling user configurations".into(),
                message: msg,
            },
            ConfigError::TOMLSerde(msg) => ApiError {
                error_type: "TOML error handling user configurations".into(),
                message: msg,
            },
            ConfigError::LegacyConfiguration(msg) => ApiError {
                error_type: "Error loading the legacy configuration".into(),
                message: msg,
            },
            ConfigError::ClusterNotFound(cluster_id) => ApiError {
                error_type: "User configuration error".into(),
                message: format!("Cluster {} not found", cluster_id),
            },
        }
    }
}
