use rdkafka::error::KafkaError;

#[derive(Debug)]
pub enum Error {
    AvroParse { message: String },
    IO { message: String },
    JSONSerde { message: String },
    Consumer { message: String },
    Kafka { message: String },
    SqlError { message: String },
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

impl From<KafkaError> for Error {
    fn from(error: KafkaError) -> Self {
        Error::Kafka {
            message: format!("{}", error),
        }
    }
}
