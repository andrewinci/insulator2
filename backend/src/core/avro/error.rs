use crate::core::schema_registry::SchemaRegistryError;

#[derive(Debug, PartialEq, Eq)]
pub enum AvroError {
    InvalidNumber(String),
    MissingField(String),
    SchemaProvider(String, SchemaRegistryError),
    InvalidUnion(String),
    Unsupported(String),
    InvalidAvroHeader(String),
    ParseAvroValue(String),
    ParseJsonValue(String),
    InvalidEnum(String),
    InvalidUUID(String),
}

pub type AvroResult<T> = std::result::Result<T, AvroError>;
