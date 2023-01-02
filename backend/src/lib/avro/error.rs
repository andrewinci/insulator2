use crate::lib::schema_registry::SchemaRegistryError;

#[derive(Debug)]
pub enum AvroError {
    InvalidNumber(String),
    MissingAvroSchemaReference(String),
    MissingField(String),
    SchemaProvider(String, SchemaRegistryError),
    InvalidUnion(String),
    Unsupported(String),
    InvalidAvroHeader(String),
    ParseAvroValue(apache_avro::Error),
    ParseJsonValue(serde_json::Error),
}

pub type AvroResult<T> = std::result::Result<T, AvroError>;
