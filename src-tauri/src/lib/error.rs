use rdkafka::error::KafkaError;

#[derive(Debug)]
pub enum Error {
    AvroParse {
        message: String,
    },
    IOError {
        message: String,
    },
    JSONSerdeError {
        message: String,
    },
    ConsumerError {
        message: String,
    },
    KafkaError {
        message: String,
    },
}

pub(super) type Result<T> = core::result::Result<T, Error>;

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Error::IOError {
            message: error.to_string(),
        }
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Error::JSONSerdeError {
            message: error.to_string(),
        }
    }
}

impl From<KafkaError> for Error {
    fn from(error: KafkaError) -> Self {
        Error::KafkaError {
            message: format!("{}", error),
        }
    }
}