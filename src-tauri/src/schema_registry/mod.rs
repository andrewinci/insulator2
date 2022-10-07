mod client;
mod error;
mod http_client;
mod types;

use client::CachedSchemaRegistry as CachedSchemaRegistryImpl;
pub use client::SchemaRegistryClient;
pub use error::SchemaRegistryError;
pub use http_client::{ HttpClient, ReqwestClient };
pub use types::{ BasicAuth, Schema };

use crate::configuration::SchemaRegistry;

pub struct CachedSchemaRegistry;

impl CachedSchemaRegistry {
    pub fn new(config: &SchemaRegistry) -> Box<dyn SchemaRegistryClient + Send + Sync> {
        let http_client = ReqwestClient::new(Some(10));
        let auth = config.username.clone().map(|username| BasicAuth {
            username,
            password: config.password.clone(),
        });
        Box::new(CachedSchemaRegistryImpl::new(config.endpoint.clone(), auth, http_client))
    }
}