mod avro_parser;
mod avro_schema;
mod avro_to_json;
mod error;
mod helpers;
mod json_to_avro;
mod schema_provider;

#[cfg(test)]
mod parser_e2e_tests;

pub use avro_parser::AvroParser;
pub use error::AvroError;
pub use schema_provider::SchemaProvider;
