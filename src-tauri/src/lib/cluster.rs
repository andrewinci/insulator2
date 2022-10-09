use crate::{
    lib::{
        schema_registry::{ SchemaRegistryClient, CachedSchemaRegistry },
        consumer::{ Consumer, KafkaConsumer },
        admin::{ Admin, KafkaAdmin },
        parser::{ Parser, RecordParser },
        configuration::{ ClusterConfig, SchemaRegistryConfig },
    },
};

pub struct Cluster {
    config: ClusterConfig,
    schema_registry_client: Option<Box<dyn SchemaRegistryClient>>,
    consumer_client: Box<dyn Consumer>,
    admin_client: Box<dyn Admin>,
    parser: Box<dyn Parser>,
}

impl Cluster {
    fn new(config: ClusterConfig) -> Cluster {
        let cluster_config = config.clone();
        //todo: share schema registry client
        // build kafka consumer client
        let consumer_client: Box<dyn Consumer> = Box::new(KafkaConsumer::new());
        // build the admin client
        let admin_client: Box<dyn Admin> = Box::new(KafkaAdmin::new());
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
            consumer_client,
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