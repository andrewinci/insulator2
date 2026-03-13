#![cfg(test)]

use rdkafka::producer::{FutureProducer, FutureRecord};
use std::time::Duration;

use crate::{core::admin::KafkaAdmin, integration_tests::KafkaTest};

// ─── Topic configuration tests ───────────────────────────────────────────────

#[tokio::test]
async fn test_get_topic_configuration_delete_policy() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();

    sut.create_topic(&topic, 1, 1, false /* delete policy */)
        .await
        .expect("create_topic failed");

    // act
    let config = sut
        .get_topic_configuration(&topic)
        .await
        .expect("get_topic_configuration failed");

    // assert
    assert_eq!(
        config.get("cleanup.policy").unwrap(),
        &Some("delete".to_string()),
        "Expected cleanup.policy=delete for a non-compacted topic"
    );
}

#[tokio::test]
async fn test_get_topic_configuration_compact_policy() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();

    sut.create_topic(&topic, 1, 1, true /* compact policy */)
        .await
        .expect("create_topic failed");

    // act
    let config = sut
        .get_topic_configuration(&topic)
        .await
        .expect("get_topic_configuration failed");

    // assert
    assert_eq!(
        config.get("cleanup.policy").unwrap(),
        &Some("compact".to_string()),
        "Expected cleanup.policy=compact for a compacted topic"
    );
}

#[tokio::test]
async fn test_get_topic_returns_correct_partition_count() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();

    sut.create_topic(&topic, 5, 1, false)
        .await
        .expect("create_topic failed");

    let t = sut.get_topic(&topic).expect("get_topic failed");
    assert_eq!(t.partitions.len(), 5, "Expected 5 partitions");
    assert_eq!(t.name, topic);
}

#[tokio::test]
async fn test_delete_topic_not_found_returns_error() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");

    // Deleting a topic that does not exist should return an error
    let result = sut.delete_topic("this-topic-does-not-exist-xyz-123").await;
    assert!(result.is_err(), "Expected error when deleting a non-existent topic");
}

#[tokio::test]
async fn test_get_last_offsets_multi_partition() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();
    let num_partitions = 3_i32;

    sut.create_topic(&topic, num_partitions, 1, false)
        .await
        .expect("create_topic failed");

    let producer: FutureProducer = test_fixture.build_kafka_client();
    let total_records = 12_u32;
    for i in 0..total_records {
        producer
            .send(
                FutureRecord::to(&topic)
                    .key(&format!("k-{i}"))
                    .payload(&format!("v-{i}")),
                Duration::from_secs(10),
            )
            .await
            .expect("produce failed");
    }

    // act
    let offsets = sut.get_last_offsets(&[&topic]).await.expect("get_last_offsets failed");

    // assert
    let partition_offsets = offsets.get(&topic).expect("topic missing from result");
    assert_eq!(
        partition_offsets.len(),
        num_partitions as usize,
        "Expected one PartitionOffset entry per partition"
    );
    let total: i64 = partition_offsets.iter().map(|po| po.offset).sum();
    assert_eq!(
        total, total_records as i64,
        "Sum of partition offsets should equal total produced records"
    );
}

#[tokio::test]
async fn test_get_last_offsets_multiple_topics() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");

    let topic_a = KafkaTest::get_random_name();
    let topic_b = KafkaTest::get_random_name();
    sut.create_topic(&topic_a, 1, 1, false)
        .await
        .expect("create topic_a failed");
    sut.create_topic(&topic_b, 1, 1, false)
        .await
        .expect("create topic_b failed");

    let producer: FutureProducer = test_fixture.build_kafka_client();
    for i in 0..4_u32 {
        producer
            .send(
                FutureRecord::to(&topic_a).key(&format!("k-{i}")).payload("v"),
                Duration::from_secs(10),
            )
            .await
            .expect("produce to topic_a failed");
    }
    for i in 0..7_u32 {
        producer
            .send(
                FutureRecord::to(&topic_b).key(&format!("k-{i}")).payload("v"),
                Duration::from_secs(10),
            )
            .await
            .expect("produce to topic_b failed");
    }

    // act
    let offsets = sut
        .get_last_offsets(&[topic_a.as_str(), topic_b.as_str()])
        .await
        .expect("get_last_offsets failed");

    // assert
    let offset_a: i64 = offsets[&topic_a].iter().map(|p| p.offset).sum();
    let offset_b: i64 = offsets[&topic_b].iter().map(|p| p.offset).sum();
    assert_eq!(offset_a, 4, "Expected 4 records in topic_a");
    assert_eq!(offset_b, 7, "Expected 7 records in topic_b");
}

// ─── Consumer group state tests ───────────────────────────────────────────────

#[tokio::test]
async fn test_get_consumer_group_state_empty() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();
    let consumer_group = KafkaTest::get_random_name();

    // produce a record so the topic exists
    let producer: FutureProducer = test_fixture.build_kafka_client();
    producer
        .send(FutureRecord::to(&topic).key("k").payload("v"), Duration::from_secs(10))
        .await
        .expect("produce failed");

    // create consumer group at the beginning
    sut.set_consumer_group(
        &consumer_group,
        &[&topic],
        &crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
    )
    .expect("set_consumer_group failed");

    // act
    let state = sut
        .get_consumer_group_state(&consumer_group)
        .expect("get_consumer_group_state failed");

    // assert — a committed-but-inactive consumer group should be in "Empty" state
    assert_eq!(
        state, "Empty",
        "Inactive consumer group should be in Empty state, got: {state}"
    );
}

#[tokio::test]
async fn test_describe_consumer_group_multiple_topics() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");

    let topic_a = KafkaTest::get_random_name();
    let topic_b = KafkaTest::get_random_name();
    let consumer_group = KafkaTest::get_random_name();

    let producer: FutureProducer = test_fixture.build_kafka_client();
    for t in [&topic_a, &topic_b] {
        producer
            .send(FutureRecord::to(t).key("k").payload("v"), Duration::from_secs(10))
            .await
            .expect("produce failed");
    }

    // create consumer group subscribed to both topics
    sut.set_consumer_group(
        &consumer_group,
        &[topic_a.as_str(), topic_b.as_str()],
        &crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
    )
    .expect("set_consumer_group failed");

    // act
    let info = sut
        .describe_consumer_group(&consumer_group, true)
        .await
        .expect("describe_consumer_group failed");

    // assert — the consumer group should have committed offsets for both topics
    assert_eq!(info.name, consumer_group);
    let topics_in_result: std::collections::HashSet<_> = info.offsets.iter().map(|o| o.topic.as_str()).collect();
    assert!(
        topics_in_result.contains(topic_a.as_str()),
        "topic_a missing from describe result"
    );
    assert!(
        topics_in_result.contains(topic_b.as_str()),
        "topic_b missing from describe result"
    );
}

#[tokio::test]
async fn test_consumer_group_offset_at_end() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let sut = KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("create admin failed");
    let topic = KafkaTest::get_random_name();
    let consumer_group = KafkaTest::get_random_name();

    sut.create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    // produce 5 records
    let producer: FutureProducer = test_fixture.build_kafka_client();
    for i in 0..5_u32 {
        producer
            .send(
                FutureRecord::to(&topic).key(&format!("k-{i}")).payload("v"),
                Duration::from_secs(10),
            )
            .await
            .expect("produce failed");
    }

    // set consumer group at End
    sut.set_consumer_group(
        &consumer_group,
        &[&topic],
        &crate::core::consumer::types::ConsumerOffsetConfiguration::End,
    )
    .expect("set_consumer_group to End failed");

    let info = sut
        .describe_consumer_group(&consumer_group, true)
        .await
        .expect("describe failed");

    assert_eq!(info.offsets.len(), 1);
    assert_eq!(
        info.offsets[0].offset, 5,
        "Offset at End should equal total records (5)"
    );
}
