use async_trait::async_trait;

use crate::lib::schema_registry::{CachedSchemaRegistry, ResolvedAvroSchema, Result};

#[async_trait]
pub trait SchemaProvider: Send + Sync {
    async fn get_schema_by_id(&self, id: i32) -> Result<ResolvedAvroSchema>;
}

#[async_trait]
impl SchemaProvider for CachedSchemaRegistry {
    async fn get_schema_by_id(&self, id: i32) -> Result<ResolvedAvroSchema> {
        self.get_schema_by_id(id).await
    }
}
