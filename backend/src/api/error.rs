use crate::lib::{
    admin::AdminError, configuration::ConfigError, consumer::ConsumerError, producer::ProducerError,
    record_store::StoreError, schema_registry::SchemaRegistryError,
};
use serde::{Deserialize, Serialize};

pub type ApiResult<T> = std::result::Result<T, ApiError>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiError {
    #[serde(rename = "errorType")]
    pub error_type: String,
    pub message: String,
}

impl From<SchemaRegistryError> for ApiError {
    fn from(err: SchemaRegistryError) -> Self {
        ApiError {
            error_type: "Schema registry error".into(),
            message: match err {
                SchemaRegistryError::HttpClient(msg) => msg,
                SchemaRegistryError::SchemaParsing(msg) => msg,
                SchemaRegistryError::SchemaNotFound(msg) => msg,
                SchemaRegistryError::InvalidUrl => "Invalid url".into(),
            },
        }
    }
}

impl From<StoreError> for ApiError {
    fn from(value: StoreError) -> Self {
        match value {
            StoreError::SqlError(message) => ApiError {
                error_type: "Records store error: SQL".into(),
                message,
            },
            StoreError::IO(message) => ApiError {
                error_type: "Records store error: IO".into(),
                message,
            },
            StoreError::RecordParse(message) => ApiError {
                error_type: "Records store error: Parsing the record".into(),
                message,
            },
        }
    }
}

impl From<ConsumerError> for ApiError {
    fn from(value: ConsumerError) -> Self {
        todo!()
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

impl From<ProducerError> for ApiError {
    fn from(value: ProducerError) -> Self {
        match value {
            ProducerError::MissingAvroConfiguration => Self {
                error_type: "Missing avro configuration".into(),
                message: "Unable to parse the record to avro".into(),
            },
            ProducerError::RDKafka(message) => ApiError {
                error_type: "RDKafkaLib error trying to produce".into(),
                message,
            },
            ProducerError::AvroParse(avro_error) => ApiError {
                error_type: "Avro serialization error".into(),
                message: "Missing avro error".into(),
            },
        }
    }
}
