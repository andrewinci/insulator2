mod client;
mod error;
mod types;

pub use client::SchemaRegistryClient;
pub use error::{ SchemaRegistryError, Result };
pub use types::{ BasicAuth, Schema };
pub use client::CachedSchemaRegistry;