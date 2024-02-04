#![cfg(test)]

use rdkafka::{config::FromClientConfig, ClientConfig};
use std::time::Duration;
use uuid::Uuid;

use crate::core::configuration::{ClusterConfig, Favorites};

mod consumer_group_admin_it;
mod topic_admin_it;

struct KafkaTest {
    pub tmo: Duration,
    pub default_consumer_group: String,
    pub bootstrap_servers: String,
}

impl Default for KafkaTest {
    fn default() -> Self {
        Self {
            tmo: Duration::from_secs(60),
            default_consumer_group: KafkaTest::get_random_name(),
            bootstrap_servers: "127.0.0.1:9092".into(),
        }
    }
}

impl KafkaTest {
    fn build_kafka_client<T: FromClientConfig>(&self) -> T {
        ClientConfig::new()
            .set("group.id", self.default_consumer_group.to_string())
            .set("bootstrap.servers", self.bootstrap_servers.to_string())
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "true")
            .set("auto.offset.reset", "earliest")
            .create()
            .expect("Unable to create the kafka client")
    }

    fn build_cluster_config(&self) -> ClusterConfig {
        ClusterConfig {
            id: "cluster-id".into(),
            name: "test-cluster-name".into(),
            endpoint: self.bootstrap_servers.to_string(),
            authentication: crate::core::configuration::AuthenticationConfig::None,
            schema_registry: None,
            favorites: Favorites::default(),
        }
    }

    fn get_random_name() -> String {
        format!("test_{}", Uuid::new_v4())
    }
}
