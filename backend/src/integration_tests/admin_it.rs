#[cfg(target_os = "linux")]
#[cfg(test)]
mod integration_tests {
    use rdkafka::{
        config::{ClientConfig, FromClientConfig},
        consumer::{stream_consumer::StreamConsumer, Consumer},
    };
    use std::time::Duration;
    use testcontainers::{clients, images::kafka};

    use crate::lib::{
        admin::{KafkaAdmin, TopicAdmin},
        configuration::{ClusterConfig, Favorites},
    };

    struct KafkaTestFixture {
        pub cluster_config: ClusterConfig,
        pub consumer: StreamConsumer,
        // pub producer: FutureProducer,
        // pub admin: AdminClient<DefaultClientContext>,
        pub tmo: Duration,
    }

    fn init_test() -> KafkaTestFixture {
        let docker = clients::Cli::default();
        let kafka_node = docker.run(kafka::Kafka::default());

        let bootstrap_servers = format!("127.0.0.1:{}", kafka_node.get_host_port_ipv4(kafka::KAFKA_PORT));

        fn build_kafka_client<T: FromClientConfig>(bootstrap_servers: &str) -> T {
            ClientConfig::new()
                .set("group.id", "testcontainer-rs")
                .set("bootstrap.servers", bootstrap_servers)
                .set("session.timeout.ms", "6000")
                .set("enable.auto.commit", "false")
                .set("auto.offset.reset", "earliest")
                .create()
                .expect("Unable to create the kafka client")
        }

        KafkaTestFixture {
            tmo: Duration::from_secs(30),
            consumer: build_kafka_client(&bootstrap_servers),
            // producer: build_kafka_client(&bootstrap_servers),
            // admin: build_kafka_client(&bootstrap_servers),
            cluster_config: ClusterConfig {
                id: "cluster-id".into(),
                name: "test-cluster-name".into(),
                endpoint: bootstrap_servers,
                authentication: crate::lib::configuration::AuthenticationConfig::None,
                schema_registry: None,
                favorites: Favorites::default(),
            },
        }
    }

    #[tokio::test]
    async fn produce_and_consume_messages() {
        // arrange
        let KafkaTestFixture {
            tmo,
            cluster_config,
            consumer,
            ..
        } = init_test();

        let sut = KafkaAdmin::new(&cluster_config, tmo.clone()).expect("Unable to create the admin client");
        let test_topic_name = "test_topic_name";
        // test create a topic
        {
            let partition_count = 7_usize;
            // act
            sut.create_topic(test_topic_name, partition_count as i32, 1, false)
                .await
                .expect("Unable to create the test topic");

            // assert
            let metadata = consumer
                .fetch_metadata(None, tmo)
                .expect("Unable to retrieve the metadata");
            let tp: Vec<_> = metadata
                .topics()
                .iter()
                .map(|t| (t.name(), t.partitions().len()))
                .collect();

            assert!(tp.contains(&(test_topic_name, partition_count)))
        }
    }
}
