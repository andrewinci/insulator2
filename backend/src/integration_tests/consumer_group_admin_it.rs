#![cfg(test)]
use rdkafka::{
    consumer::{BaseConsumer, Consumer},
    producer::{BaseProducer, BaseRecord},
};
use std::time::Duration;

use crate::{core::admin::KafkaAdmin, integration_tests::KafkaTest};

#[tokio::test]
async fn test_consumer_groups_admin_client() {
    // arrange
    let test_fixture = KafkaTest::new();

    let consumer: BaseConsumer = test_fixture.build_kafka_client();
    let producer: BaseProducer = test_fixture.build_kafka_client();
    let cluster_config = test_fixture.build_cluster_config();

    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create the admin client");
    let test_topic_name = "test_topic_name";
    // produce a record to create the topic
    producer
        .send(BaseRecord::to(&test_topic_name).key("key").payload("content"))
        .expect("Unable to produce the message");

    // test list consumer groups
    {
        // arrange
        // create a consumer group by consuming the test topic
        consumer
            .subscribe(&[&test_topic_name])
            .expect("Unable to subscribe to the test topic");
        let consumed = consumer.poll(Duration::from_secs(60)).unwrap();
        assert!(consumed.is_ok());
        // act
        let res = sut.list_consumer_groups().expect("");
        // assert
        assert_eq!(res, vec![test_fixture.default_consumer_group])
    }

    // test create consumer groups
    {
        let test_consumer_group = "test-consumer-group";
        // act
        let res = sut.set_consumer_group(
            test_consumer_group,
            &[&test_topic_name],
            &crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
        );
        // assert
        assert!(res.is_ok());
        let consumer_groups = consumer
            .fetch_group_list(None, test_fixture.tmo)
            .expect("Unable to retrieve the list of consumer groups");
        assert!(!consumer_groups
            .groups()
            .iter()
            .filter(|cg| cg.name() == test_consumer_group)
            .collect::<Vec<_>>()
            .is_empty())
    }

    // test delete consumer group
    {
        let test_consumer_group = "test-delete-consumer-group";
        sut.set_consumer_group(
            test_consumer_group,
            &[&test_topic_name],
            &crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
        )
        .expect("Unable to create the consumer group for the test");
        // act
        let res = sut.delete_consumer_group(test_consumer_group).await;
        // assert
        assert!(res.is_ok());
        let consumer_groups = consumer
            .fetch_group_list(None, test_fixture.tmo)
            .expect("Unable to retrieve the list of consumer groups");
        assert!(consumer_groups
            .groups()
            .iter()
            .filter(|cg| cg.name() == test_consumer_group)
            .collect::<Vec<_>>()
            .is_empty())
    }

    // test describe consumer group
    {
        let test_consumer_group = "test-delete-consumer-group";
        sut.set_consumer_group(
            test_consumer_group,
            &[&test_topic_name],
            &crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
        )
        .expect("Unable to create the consumer group for the test");
        // act
        let res = sut
            .describe_consumer_group(test_consumer_group, true)
            .await
            .expect("Unable to describe the consumer group");
        // assert
        assert_eq!(res.offsets.len(), 1);
        assert_eq!(res.offsets[0].offset, 0);
        assert_eq!(res.offsets[0].topic, test_topic_name);
    }
}
