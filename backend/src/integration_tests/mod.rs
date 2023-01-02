#![cfg(test)]

use once_cell::sync::Lazy;
use rdkafka::{config::FromClientConfig, ClientConfig};
use std::time::Duration;
use testcontainers::{clients, images::kafka};

use crate::lib::configuration::{ClusterConfig, Favorites};

mod consumer_group_admin_it;
mod topic_admin_it;

static DOCKER: Lazy<clients::Cli> = Lazy::new(clients::Cli::default);

struct KafkaTest<'a> {
    pub tmo: Duration,
    pub default_consumer_group: String,
    pub bootstrap_servers: String,
    _kafka_node: testcontainers::Container<'a, kafka::Kafka>,
}

impl<'a> KafkaTest<'a> {
    fn new() -> Self {
        let tmo = Duration::from_secs(30);
        let kafka_node = DOCKER.run(kafka::Kafka::default());

        let bootstrap_servers = format!("127.0.0.1:{}", kafka_node.get_host_port_ipv4(kafka::KAFKA_PORT));
        kafka_node.start();

        Self {
            tmo,
            default_consumer_group: "testcontainer-rs".into(),
            bootstrap_servers,
            _kafka_node: kafka_node,
        }
    }

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
            authentication: crate::lib::configuration::AuthenticationConfig::None,
            schema_registry: None,
            favorites: Favorites::default(),
        }
    }
}
