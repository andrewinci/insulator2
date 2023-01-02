use rdkafka::error::KafkaError;
use serde::Serialize;

use super::{admin::AdminError, avro::AvroError};

#[derive(Serialize, Debug, Clone, PartialEq, Eq)]
pub enum LibError {
    Generic { message: String },
    AvroParse { message: String },
    IO { message: String },
    JSONSerde { message: String },
    TOMLSerde { message: String },
    Consumer { message: String },
    Kafka { message: String },
    SqlError { message: String },
    LegacyConfiguration { message: String },
}

pub type LibResult<T> = core::result::Result<T, LibError>;

impl From<std::io::Error> for LibError {
    fn from(error: std::io::Error) -> Self {
        LibError::IO {
            message: error.to_string(),
        }
    }
}

impl From<serde_json::Error> for LibError {
    fn from(error: serde_json::Error) -> Self {
        LibError::JSONSerde {
            message: error.to_string(),
        }
    }
}

impl From<toml::de::Error> for LibError {
    fn from(error: toml::de::Error) -> Self {
        LibError::TOMLSerde {
            message: error.to_string(),
        }
    }
}

impl From<toml::ser::Error> for LibError {
    fn from(error: toml::ser::Error) -> Self {
        LibError::TOMLSerde {
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
            AvroError::SchemaProvider(m) => Self::AvroParse { message: m },
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
