use std::{ collections::HashMap, sync::Arc };

use futures::lock::Mutex;
use log::debug;

use crate::lib::{
    admin::{ Admin, KafkaAdmin },
    configuration::{ ClusterConfig, SchemaRegistryConfig },
    consumer::Consumer,
    parser::{ Parser, RecordParser },
    schema_registry::{ CachedSchemaRegistry, SchemaRegistryClient },
};

use super::consumer::KafkaConsumer;

type TopicName = String;
#[derive(Clone)]
pub struct Cluster {
    pub config: ClusterConfig,
    pub schema_registry_client: Option<Arc<dyn SchemaRegistryClient + Send + Sync>>,
    consumers: Arc<Mutex<HashMap<TopicName, Arc<dyn Consumer + Send + Sync>>>>,
    pub admin_client: Arc<dyn Admin + Send + Sync>,
    pub parser: Arc<dyn Parser + Send + Sync>,
}

impl Cluster {
    pub fn new(config: &ClusterConfig) -> Cluster {
        let (schema_registry_client, parser) = if
            let Some(SchemaRegistryConfig { endpoint, username, password }) = &config.schema_registry
        {
            let ptr: Arc<dyn SchemaRegistryClient + Send + Sync> = Arc::new(
                CachedSchemaRegistry::new(endpoint, username.as_deref(), password.as_deref())
            );
            (Some(ptr.clone()), RecordParser::new(Some(ptr.clone())))
        } else {
            (None, RecordParser::new(None))
        };
        Cluster {
            config: config.clone(),
            schema_registry_client,
            consumers: Arc::new(Mutex::new(HashMap::new())),
            admin_client: Arc::new(KafkaAdmin::new(config)),
            parser: Arc::new(parser),
        }
    }

    pub async fn get_consumer(&self, topic_name: &str) -> Arc<dyn Consumer + Send + Sync> {
        let mut consumers = self.consumers.lock().await;
        if consumers.get(topic_name).is_none() {
            debug!("Create consumer for topic {}", topic_name);
            consumers.insert(
                topic_name.to_string(),
                Arc::new(KafkaConsumer::new(&self.config, topic_name, self.admin_client.clone()))
            );
        }
        consumers.get(topic_name).expect("the consumer must exists").clone()
    }
}