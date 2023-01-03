use crate::lib::{
    admin::AdminError, avro::AvroError, configuration::ConfigError, consumer::ConsumerError, producer::ProducerError,
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
        match err {
            SchemaRegistryError::SchemaNotFound(message) => ApiError {
                error_type: "Schema registry error: Schema not found".into(),
                message,
            },
            SchemaRegistryError::SchemaParsing(message) => ApiError {
                error_type: "Schema registry error: Unable to parse the schema".into(),
                message,
            },
            SchemaRegistryError::HttpClient(message) => ApiError {
                error_type: "Schema registry error: HTTPClient".into(),
                message,
            },
            SchemaRegistryError::InvalidUrl(message) => ApiError {
                error_type: "Schema registry error: Invalid URL".into(),
                message,
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
        match value {
            ConsumerError::RDKafka(message) => ApiError {
                error_type: "Consumer error: RDKafkaLib".into(),
                message,
            },
            ConsumerError::RecordStore(_, records_store_error) => records_store_error.into(),
            ConsumerError::AlreadyRunning(message) => ApiError {
                error_type: "Consumer error".into(),
                message,
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
            ProducerError::AvroParse(avro_error) => avro_error.into(),
        }
    }
}

impl From<AvroError> for ApiError {
    fn from(value: AvroError) -> Self {
        match value {
            AvroError::InvalidNumber(message) => ApiError {
                error_type: "Avro error: InvalidNumber".into(),
                message,
            },
            AvroError::MissingAvroSchemaReference(message) => ApiError {
                error_type: "Avro error: MissingAvroSchemaReference".into(),
                message,
            },
            AvroError::MissingField(message) => ApiError {
                error_type: "Avro error: MissingField".into(),
                message,
            },
            AvroError::SchemaProvider(message, _) => ApiError {
                error_type: "Avro error: SchemaProvider".into(),
                message,
            },
            AvroError::InvalidUnion(message) => ApiError {
                error_type: "Avro error: InvalidUnion".into(),
                message,
            },
            AvroError::Unsupported(message) => ApiError {
                error_type: "Avro error: Unsupported".into(),
                message,
            },
            AvroError::InvalidAvroHeader(message) => ApiError {
                error_type: "Avro error: InvalidAvroHeader".into(),
                message,
            },
            AvroError::ParseAvroValue(message) => ApiError {
                error_type: "Avro error: ParseAvroValue".into(),
                message,
            },
            AvroError::ParseJsonValue(message) => ApiError {
                error_type: "Avro error: ParseJsonValue".into(),
                message,
            },
        }
    }
}
