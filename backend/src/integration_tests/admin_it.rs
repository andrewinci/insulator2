#[cfg(test)]
mod integration_tests {
    use rdkafka::{
        config::{ClientConfig, FromClientConfig},
        consumer::{stream_consumer::StreamConsumer, Consumer},
        producer::{FutureProducer, FutureRecord},
    };
    use std::{collections::HashSet, time::Duration};
    use testcontainers::{clients, images::kafka};

    use crate::lib::{
        admin::{KafkaAdmin, TopicAdmin},
        configuration::{ClusterConfig, Favorites},
    };

    #[tokio::test]
    async fn test_admin_client() {
        // arrange
        let tmo = Duration::from_secs(30);
        let docker = clients::Cli::default();
        let kafka_node = docker.run(kafka::Kafka::default());

        let bootstrap_servers = format!("127.0.0.1:{}", kafka_node.get_host_port_ipv4(kafka::KAFKA_PORT));
        kafka_node.start();

        let consumer: StreamConsumer = build_kafka_client(&bootstrap_servers.as_str());
        let cluster_config = build_cluster_config(&bootstrap_servers);

        let sut = KafkaAdmin::new(&cluster_config, tmo.clone()).expect("Unable to create the admin client");

        // test create a topic
        {
            let test_topic_name = "test_topic_name";
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

        // test retrieve the list of topics
        {
            sut.create_topic("another_test_topic", 1, 1, true)
                .await
                .expect("Unable to create a test topic");
            // act
            let res = sut.list_topics().await.expect("Unable to retrieve the list of topics");
            // assert
            let topic_set: HashSet<_> = res.iter().map(|t| (t.name.clone(), t.partitions.len())).collect();
            let metadata = consumer
                .fetch_metadata(None, tmo)
                .expect("Unable to retrieve the metadata");

            let expected_topics: HashSet<_> = metadata
                .topics()
                .iter()
                .map(|t| (t.name().to_string(), t.partitions().len()))
                .collect();

            assert_eq!(topic_set, expected_topics)
        }

        // test get topic
        {
            // arrange
            let test_topic_name = "test_get_topic";
            let partition_count = 3_usize;
            sut.create_topic(test_topic_name, partition_count as i32, 1, true)
                .await
                .expect("Unable to create a test topic");
            // act
            let res = sut.get_topic(test_topic_name).expect("Unable to get topic");
            // assert
            assert_eq!(res.name, test_topic_name.to_string());
            assert_eq!(res.partitions.len(), partition_count);
        }

        // test get topic info
        {
            // arrange
            let test_topic_name = "test_get_topic_info";
            let partition_count = 3_usize;
            sut.create_topic(test_topic_name, partition_count as i32, 1, true)
                .await
                .expect("Unable to create a test topic");
            // act
            let res = sut.get_topic_info(test_topic_name).await.expect("get_topic_info error");
            // assert
            assert_eq!(res.name, test_topic_name.to_string());
            assert_eq!(res.partitions.len(), partition_count);
            assert_eq!(
                res.configurations.get("cleanup.policy").unwrap(),
                &Some("compact".to_string())
            );
        }

        // delete topic test
        {
            // arrange
            let test_topic_name = "test_delete_topic";
            sut.create_topic(test_topic_name, 1, 1, true)
                .await
                .expect("Unable to create a test topic");
            // act
            let res = sut.delete_topic(test_topic_name).await;
            // assert
            assert!(res.is_ok())
        }

        // get last offset
        {
            // arrange
            let expected_offset = 13;
            let test_topic_name = "test_get_last_offset";
            let producer: FutureProducer = build_kafka_client(&bootstrap_servers);
            sut.create_topic(test_topic_name, 1, 1, true)
                .await
                .expect("Unable to create a test topic");
            // produce some records to increase the offset
            for i in 0..expected_offset {
                producer
                    .send(
                        FutureRecord::to(test_topic_name)
                            .payload(&format!("test_message {}", i))
                            .key(&format!("Key {}", i)),
                        Duration::from_secs(0),
                    )
                    .await
                    .expect("Unable to produce the message");
            }
            // act
            let res = sut
                .get_last_offsets(&[test_topic_name])
                .await
                .expect("get_last_offsets error");

            // assert
            let topic_result = res.get(test_topic_name).expect("Invalid result");
            // since there is only one partition we expect to get only one offset
            assert_eq!(topic_result.len(), 1);
            assert_eq!(topic_result[0].offset, expected_offset)
        }
    }

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

    fn build_cluster_config(bootstrap_servers: &str) -> ClusterConfig {
        ClusterConfig {
            id: "cluster-id".into(),
            name: "test-cluster-name".into(),
            endpoint: bootstrap_servers.to_string(),
            authentication: crate::lib::configuration::AuthenticationConfig::None,
            schema_registry: None,
            favorites: Favorites::default(),
        }
    }
}
