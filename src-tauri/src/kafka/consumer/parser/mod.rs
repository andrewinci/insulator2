mod avro_parser;
mod string_parser;

pub use avro_parser::AvroParser;
pub use string_parser::parse_record as parse_string_record;