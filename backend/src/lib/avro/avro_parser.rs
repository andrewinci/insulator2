use std::sync::Arc;

use super::schema_provider::SchemaProvider;

pub struct AvroParser<S: SchemaProvider> {
    schema_provider: Arc<S>,
}

impl<S: SchemaProvider> AvroParser<S> {
    fn new(schema_provider: Arc<S>) -> Self {
        Self { schema_provider }
    }
}
