use rdkafka::error::KafkaError;
use serde::Serialize;

use super::avro::AvroError;

#[derive(Serialize, Debug, Clone, PartialEq, Eq)]
pub enum Error {
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

pub type Result<T> = core::result::Result<T, Error>;

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Error::IO {
            message: error.to_string(),
        }
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Error::JSONSerde {
            message: error.to_string(),
        }
    }
}

impl From<toml::de::Error> for Error {
    fn from(error: toml::de::Error) -> Self {
        Error::TOMLSerde {
            message: error.to_string(),
        }
    }
}

impl From<toml::ser::Error> for Error {
    fn from(error: toml::ser::Error) -> Self {
        Error::TOMLSerde {
            message: error.to_string(),
        }
    }
}

impl From<KafkaError> for Error {
    fn from(error: KafkaError) -> Self {
        Error::Kafka {
            message: format!("{}", error),
        }
    }
}

impl From<AvroError> for Error {
    fn from(value: AvroError) -> Self {
        match value {
            AvroError::InvalidNumber(m) => Self::AvroParse { message: m },
            AvroError::MissingAvroSchemaReference(m) => Self::AvroParse { message: m },
            AvroError::MissingField(m) => Self::AvroParse { message: m },
            //todo: this should be a schema registry error
            AvroError::SchemaProvider(m) => Self::AvroParse { message: m },
            AvroError::InvalidUnion(m) => Self::AvroParse { message: m },
            AvroError::Unsupported(m) => Self::AvroParse { message: m },
        }
    }
}
