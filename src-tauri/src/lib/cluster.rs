use std::{ sync::Arc, collections::HashMap };

use futures::lock::Mutex;

use crate::{
    lib::{
        schema_registry::{ SchemaRegistryClient, CachedSchemaRegistry },
        consumer::{ Consumer, KafkaConsumer },
        admin::{ Admin, KafkaAdmin },
        parser::{ Parser, RecordParser },
        configuration::{ ClusterConfig, SchemaRegistryConfig },
    },
};

type TopicName = String;
pub struct Cluster {
    config: ClusterConfig,
    schema_registry_client: Option<Box<dyn SchemaRegistryClient>>,
    consumers: Arc<Mutex<HashMap<TopicName, Box<dyn Consumer>>>>,
    admin_client: Box<dyn Admin>,
    parser: Box<dyn Parser>,
}

impl Cluster {
    fn new(config: ClusterConfig) -> Cluster {
        let cluster_config = config.clone();
        //todo: share schema registry client
        // build the admin client
        let admin_client: Box<dyn Admin> = Box::new(KafkaAdmin::new(&cluster_config));
        // build the parser
        let parser: Box<dyn Parser> = Box::new(
            RecordParser::new(build_schema_registry_client(config.schema_registry.clone()))
        );
        Cluster {
            config: cluster_config,
            schema_registry_client: match build_schema_registry_client(config.schema_registry.clone()) {
                Some(client) => Some(Box::new(client)),
                None => None,
            },
            consumers: Arc::new(Mutex::new(HashMap::new())),
            admin_client,
            parser,
        }
    }
}

fn build_schema_registry_client(config: Option<SchemaRegistryConfig>) -> Option<CachedSchemaRegistry> {
    if let Some(SchemaRegistryConfig { endpoint, username, password }) = config {
        Some(CachedSchemaRegistry::new(endpoint, &username, &password))
    } else {
        None
    }
}