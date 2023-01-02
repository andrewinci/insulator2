#[derive(Debug)]
pub enum AvroError {
    InvalidNumber(String),
    MissingAvroSchemaReference(String),
    MissingField(String),
    SchemaProvider(String),
    InvalidUnion(String),
    Unsupported(String),
}

pub type AvroResult<T> = std::result::Result<T, AvroError>;
