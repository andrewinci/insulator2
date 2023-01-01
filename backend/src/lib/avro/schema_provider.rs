use async_trait::async_trait;

use crate::lib::schema_registry::{CachedSchemaRegistry, ResolvedAvroSchema};

use super::error::{AvroError, AvroResult};

#[async_trait]
pub trait SchemaProvider: Send + Sync {
    async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema>;
}

#[async_trait]
impl SchemaProvider for CachedSchemaRegistry {
    async fn get_schema_by_id(&self, id: i32) -> AvroResult<ResolvedAvroSchema> {
        self.get_schema_by_id(id)
            .await
            .map_err(|_| AvroError::SchemaProvider(format!("Unable to retrieve the schema id {}", id)))
    }
}
