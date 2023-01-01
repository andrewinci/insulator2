use log::{debug, trace};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

use crate::lib::{
    admin::KafkaAdmin, consumer::KafkaConsumer, record_store::TopicStore, schema_registry::CachedSchemaRegistry, Result,
};

use super::{
    configuration::InsulatorConfig, parser::Parser, producer::KafkaProducer, record_store::SqliteStore,
    types::ErrorCallback,
};

type TopicName = String;

pub struct Cluster {
    pub cluster_id: String,
    pub config: InsulatorConfig,
    pub schema_registry_client: Option<Arc<CachedSchemaRegistry>>,
    pub kafka_admin_client: Arc<KafkaAdmin>,
    pub kafka_producer: Arc<KafkaProducer>,
    pub parser: Arc<Parser>,
    pub store: Arc<SqliteStore>,
    active_kafka_consumers: Arc<RwLock<HashMap<TopicName, Arc<KafkaConsumer>>>>,
    error_callback: ErrorCallback,
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
                (Some(ptr.clone()), Arc::new(Parser::new(Some(ptr))))
            } else {
                (None, Arc::new(Parser::new(None)))
            }
        };
        Ok(Cluster {
            cluster_id: cluster_id.to_string(),
            schema_registry_client,
            active_kafka_consumers: Arc::new(RwLock::new(HashMap::new())),
            kafka_admin_client: Arc::new(KafkaAdmin::new(&cluster_config, config.get_kafka_tmo())?),
            kafka_producer: Arc::new(KafkaProducer::new(&cluster_config, parser.clone())),
            parser,
            store: Arc::new(SqliteStore::new(config.get_sql_tmo())),
            error_callback,
            config: config.clone(),
        })
    }

    pub async fn get_consumer(&self, topic_name: &str) -> Arc<KafkaConsumer> {
        {
            if let Some(consumer) = self.active_kafka_consumers.read().await.get(topic_name) {
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
            self.active_kafka_consumers
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
