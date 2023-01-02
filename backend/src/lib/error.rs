use rdkafka::error::KafkaError;
use serde::Serialize;

use super::{admin::AdminError, avro::AvroError, configuration::ConfigError};

#[derive(Serialize, Debug, Clone, PartialEq, Eq)]
pub enum LibError {
    AvroParse { message: String },
    IO { message: String },
    Consumer { message: String },
    Kafka { message: String },
    SqlError { message: String },
}

pub type LibResult<T> = core::result::Result<T, LibError>;

impl From<std::io::Error> for LibError {
    fn from(error: std::io::Error) -> Self {
        LibError::IO {
            message: error.to_string(),
        }
    }
}

impl From<KafkaError> for LibError {
    fn from(error: KafkaError) -> Self {
        LibError::Kafka {
            message: format!("{}", error),
        }
    }
}

impl From<AvroError> for LibError {
    fn from(value: AvroError) -> Self {
        match value {
            AvroError::InvalidNumber(m) => Self::AvroParse { message: m },
            AvroError::MissingAvroSchemaReference(m) => Self::AvroParse { message: m },
            AvroError::MissingField(m) => Self::AvroParse { message: m },
            //todo: this should be a schema registry error
            AvroError::SchemaProvider(m, err) => todo!(),
            AvroError::InvalidUnion(m) => Self::AvroParse { message: m },
            AvroError::Unsupported(m) => Self::AvroParse { message: m },
            AvroError::InvalidAvroHeader(_) => todo!(),
            AvroError::ParseAvroValue(_) => todo!(),
            AvroError::ParseJsonValue(_) => todo!(),
        }
    }
}

impl From<AdminError> for LibError {
    fn from(value: AdminError) -> Self {
        todo!()
    }
}

impl From<ConfigError> for LibError {
    fn from(value: ConfigError) -> Self {
        todo!()
    }
}
