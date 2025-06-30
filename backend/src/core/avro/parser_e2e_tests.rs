#[cfg(test)]
mod tests {
    use std::{fs, str::FromStr, sync::Arc};

    use apache_avro::Schema as ApacheAvroSchema;
    use async_trait::async_trait;
    use serde_json::Value as JsonValue;

    use crate::core::avro::{error::AvroResult, AvroParser, ResolvedAvroSchema, SchemaProvider};

    #[tokio::test]
    async fn test_unnested() {
        test_parsing_loop("1_schema.json", "1_good_input.json").await
    }

    #[tokio::test]
    async fn test_enum_union_with_refs() {
        test_parsing_loop("2_schema.json", "2_good_input.json").await
    }

    /// test fixture
    struct MockSchemaRegistry {
        schema: String,
    }

    #[async_trait]
    impl SchemaProvider for MockSchemaRegistry {
        async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema> {
            Ok(ResolvedAvroSchema::from(
                id,
                &ApacheAvroSchema::parse_str(&self.schema).unwrap(),
            ))
        }
        async fn get_schema_by_name(&self, _name: &str) -> AvroResult<ResolvedAvroSchema> {
            Ok(ResolvedAvroSchema::from(
                123,
                &ApacheAvroSchema::parse_str(&self.schema).unwrap(),
            ))
        }
    }

    async fn test_parsing_loop(schema_file_name: &str, test_file_name: &str) {
        let avro_json_in = fs::read_to_string(format!("src/core/avro/test_files/{}", test_file_name)).unwrap();
        let schema = fs::read_to_string(format!("src/core/avro/test_files/{}", schema_file_name)).unwrap();
        let sut = AvroParser::new(Arc::new(MockSchemaRegistry { schema }));

        // act/assert
        let json_to_avro_result = sut.json_to_avro(&avro_json_in, "schema_name").await;

        assert!(
            json_to_avro_result.is_ok(),
            "Expected Ok, received: {:?} - File {:?}",
            json_to_avro_result,
            schema_file_name,
        );

        let avro_to_json_result = sut.avro_to_json(&json_to_avro_result.unwrap()).await;

        assert!(avro_to_json_result.is_ok());

        assert_eq!(
            JsonValue::from_str(&avro_to_json_result.unwrap().1).unwrap(),
            JsonValue::from_str(&avro_json_in).unwrap(),
        );
    }
}
