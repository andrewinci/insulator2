use std::{ sync::Arc, collections::HashMap };

use futures::lock::Mutex;
use log::debug;

use crate::{
    lib::{
        schema_registry::{ SchemaRegistryClient, CachedSchemaRegistry },
        consumer::{ Consumer },
        admin::{ Admin, KafkaAdmin },
        parser::{ Parser, RecordParser },
        configuration::{ ClusterConfig, SchemaRegistryConfig },
    },
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
    pub fn new(config: ClusterConfig) -> Cluster {
        //todo: share schema registry client
        Cluster {
            config: config.clone(),
            schema_registry_client: match build_schema_registry_client(config.schema_registry.clone()) {
                Some(client) => Some(Arc::new(client)),
                None => None,
            },
            consumers: Arc::new(Mutex::new(HashMap::new())),
            admin_client: Arc::new(KafkaAdmin::new(&config)),
            parser: Arc::new(RecordParser::new(build_schema_registry_client(config.schema_registry.clone()))),
        }
    }

    pub async fn get_consumer(&self, topic_name: &String) -> Arc<dyn Consumer + Send + Sync> {
        let mut consumers = self.consumers.lock().await;
        if consumers.get(topic_name).is_none() {
            debug!("Create consumer for topic {}", topic_name);
            consumers.insert(
                topic_name.clone(),
                Arc::new(KafkaConsumer::new(&self.config, topic_name.clone(), self.admin_client.clone()))
            );
        }
        consumers.get(topic_name).expect("the consumer must exists").clone()
    }
}
fn build_schema_registry_client(config: Option<SchemaRegistryConfig>) -> Option<CachedSchemaRegistry> {
    if let Some(SchemaRegistryConfig { endpoint, username, password }) = config {
        Some(CachedSchemaRegistry::new(endpoint, &username, &password))
    } else {
        None
    }
}