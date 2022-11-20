use rdkafka::error::KafkaError;

#[derive(Debug)]
pub enum Error {
    AvroParse { message: String },
    IO { message: String },
    JSONSerde { message: String },
    TOMLSerde { message: String },
    Consumer { message: String },
    Kafka { message: String },
    SqlError { message: String },
    LegacyConfig { message: String },
}

pub(super) type Result<T> = core::result::Result<T, Error>;

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
