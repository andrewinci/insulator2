use rdkafka::error::KafkaError;

use crate::core::parser::ParserError;

pub enum ProducerError {
    MissingAvroConfiguration,
    RDKafka(String),
    AvroParse(crate::core::avro::AvroError),
}

pub type ProducerResult<T> = Result<T, ProducerError>;

impl From<KafkaError> for ProducerError {
    fn from(error: KafkaError) -> Self {
        ProducerError::RDKafka(error.to_string())
    }
}

impl From<ParserError> for ProducerError {
    fn from(value: ParserError) -> Self {
        match value {
            ParserError::MissingAvroConfiguration => ProducerError::MissingAvroConfiguration,
            ParserError::Avro(err) => ProducerError::AvroParse(err),
        }
    }
}
