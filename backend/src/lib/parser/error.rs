use crate::lib::avro::AvroError;

pub enum ParserError {
    MissingAvroConfiguration,
    Avro(AvroError),
}

pub type ParserResult<T> = Result<T, ParserError>;

impl From<AvroError> for ParserError {
    fn from(value: AvroError) -> Self {
        ParserError::Avro(value)
    }
}
