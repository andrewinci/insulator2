use log::{debug, trace};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

use crate::lib::{
    admin::{Admin, KafkaAdmin},
    consumer::{Consumer, KafkaConsumer},
    parser::{Parser, RecordParser},
    record_store::TopicStore,
    schema_registry::{CachedSchemaRegistry, SchemaRegistryClient},
    Result,
};

use super::{configuration::InsulatorConfig, producer::KafkaProducer, record_store::SqliteStore, types::ErrorCallback};

type TopicName = String;

pub struct Cluster<SR = CachedSchemaRegistry, C = KafkaConsumer, P = RecordParser, A = KafkaAdmin>
where
    SR: SchemaRegistryClient + Send + Sync,
    C: Consumer + Send + Sync,
    P: Parser + Send + Sync,
    A: Admin + Send + Sync,
{
    pub cluster_id: String,
    pub config: InsulatorConfig,
    pub schema_registry_client: Option<Arc<SR>>,
    pub admin_client: Arc<A>,
    pub producer: Arc<KafkaProducer>,
    pub parser: Arc<P>,
    pub store: Arc<SqliteStore>,
    consumers: Arc<RwLock<HashMap<TopicName, Arc<C>>>>,
    error_callback: ErrorCallback,
}

impl Clone for Cluster<CachedSchemaRegistry> {
    fn clone(&self) -> Self {
        Self {
            cluster_id: self.cluster_id.clone(),
            config: self.config.clone(),
            schema_registry_client: self.schema_registry_client.clone(),
            consumers: self.consumers.clone(),
            producer: self.producer.clone(),
            admin_client: self.admin_client.clone(),
            parser: self.parser.clone(),
            store: self.store.clone(),
            error_callback: self.error_callback.clone(),
        }
    }
}

impl Cluster {
    pub fn new(cluster_id: &str, config: &InsulatorConfig, error_callback: ErrorCallback) -> Result<Self> {
        let cluster_config = config.get_cluster_config(cluster_id)?;
        let (schema_registry_client, parser) = {
            if let Some(s_config) = &cluster_config.schema_registry {
                let ptr = Arc::new(CachedSchemaRegistry::new(
                    s_config.endpoint.as_str(),
                    s_config.username.as_deref(),
                    s_config.password.as_deref(),
                ));
                (Some(ptr.clone()), RecordParser::new(Some(ptr)))
            } else {
                (None, RecordParser::new(None))
            }
        };
        Ok(Cluster {
            cluster_id: cluster_id.to_string(),
            schema_registry_client,
            consumers: Arc::new(RwLock::new(HashMap::new())),
            admin_client: Arc::new(KafkaAdmin::new(&cluster_config, config.get_kafka_tmo())?),
            parser: Arc::new(parser),
            producer: Arc::new(KafkaProducer::new(&cluster_config)),
            store: Arc::new(SqliteStore::new(config.get_sql_tmo())),
            error_callback,
            config: config.clone(),
        })
    }

    pub async fn get_consumer(&self, topic_name: &str) -> Arc<KafkaConsumer> {
        {
            if let Some(consumer) = self.consumers.read().await.get(topic_name) {
                trace!("Consumer for {} found in cache", topic_name);
                return consumer.clone();
            }
        }
        {
            debug!("Create consumer for topic {}", topic_name);
            let cluster_config = self
                .config
                .get_cluster_config(&self.cluster_id)
                .expect("Cluster id not found"); //todo: bubble up the error

            // create a new table for the consumer
            let topic_store =
                TopicStore::from_record_store(self.store.clone(), self.parser.clone(), &self.cluster_id, topic_name);
            let consumer = Arc::new(KafkaConsumer::new(
                &cluster_config,
                topic_name,
                topic_store,
                self.error_callback.clone(),
                self.config.get_kafka_tmo(),
            ));
            self.consumers
                .write()
                .await
                .insert(topic_name.to_string(), consumer.clone());
            consumer
        }
    }

    pub async fn get_topic_store(&self, topic_name: &str) -> Arc<TopicStore> {
        let consumer = self.get_consumer(topic_name).await;
        consumer.topic_store.clone()
    }
}
