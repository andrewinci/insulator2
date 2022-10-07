mod avro_parser;
mod string_parser;

pub use avro_parser::parse_record as parse_avro_record;
pub use string_parser::parse_record as parse_string_record;