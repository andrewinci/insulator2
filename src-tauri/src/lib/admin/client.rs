use std::time::Duration;

use super::{ConsumerGroupAdmin, TopicAdmin};
use crate::lib::configuration::{build_kafka_client_config, ClusterConfig};
use rdkafka::admin::AdminClient;
use rdkafka::{client::DefaultClientContext, consumer::StreamConsumer};

pub trait Admin: TopicAdmin + ConsumerGroupAdmin {}

pub struct KafkaAdmin {
    pub(super) config: ClusterConfig,
    pub(super) timeout: Duration,
    pub(super) consumer: StreamConsumer,
    pub(super) admin_client: AdminClient<DefaultClientContext>,
}

impl KafkaAdmin {
    pub fn new(config: &ClusterConfig) -> Self {
        KafkaAdmin {
            config: config.clone(),
            timeout: Duration::from_secs(30),
            consumer: build_kafka_client_config(config, None)
                .create()
                .expect("Unable to create a consumer for the admin client."),
            admin_client: build_kafka_client_config(config, None)
                .create()
                .expect("Unable to build the admin client"),
        }
    }
}

impl Admin for KafkaAdmin {}
