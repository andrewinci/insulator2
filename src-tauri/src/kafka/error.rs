use rdkafka::error::KafkaError;

#[derive(Debug)]
pub enum Error {
    GenericKafka {
        msg: String,
    },
    AvroParse {
        msg: String,
    },
}

pub type Result<T> = core::result::Result<T, Error>;

impl From<KafkaError> for Error {
    fn from(error: KafkaError) -> Self {
        Error::GenericKafka {
            msg: format!("{} [rdkafka error code {:?}]", error, error.rdkafka_error_code()),
        }
    }
}

impl ToString for Error {
    fn to_string(&self) -> String {
        match self {
            Error::GenericKafka { msg } => msg.into(),
            Error::AvroParse { msg } => msg.into(),
        }
    }
}