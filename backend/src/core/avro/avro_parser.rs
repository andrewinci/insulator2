use std::sync::Arc;

use super::schema_provider::SchemaProvider;

pub struct AvroParser<S: SchemaProvider> {
    pub(super) schema_provider: Arc<S>,
}

impl<S: SchemaProvider> AvroParser<S> {
    pub fn new(schema_provider: Arc<S>) -> Self {
        Self { schema_provider }
    }
}
