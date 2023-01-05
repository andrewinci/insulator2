use async_trait::async_trait;

use crate::lib::schema_registry::CachedSchemaRegistry;

use super::{
    error::{AvroError, AvroResult},
    ResolvedAvroSchema,
};

#[async_trait]
pub trait SchemaProvider: Send + Sync {
    async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema>;
    async fn get_schema_by_name(&self, name: &str) -> AvroResult<ResolvedAvroSchema>;
}

#[async_trait]
impl SchemaProvider for CachedSchemaRegistry {
    async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema> {
        self.get_schema_by_id(id)
            .await
            .map_err(|err| AvroError::SchemaProvider(format!("Unable to retrieve the schema id {}", id), err))
    }
    async fn get_schema_by_name(&self, name: &str) -> AvroResult<ResolvedAvroSchema> {
        self.get_last_schema(name)
            .await
            .map_err(|err| AvroError::SchemaProvider(format!("Unable to retrieve the schema {}", name), err))
    }
}
