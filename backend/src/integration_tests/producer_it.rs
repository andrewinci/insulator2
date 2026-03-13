#![cfg(test)]

use futures::StreamExt;
use rdkafka::{
    consumer::{Consumer, StreamConsumer},
    Message,
};

use crate::{
    core::{
        parser::Parser,
        producer::KafkaProducer,
        record_store::{SqliteStore, TopicStore},
        types::ParserMode,
    },
    integration_tests::KafkaTest,
};
use std::{sync::Arc, time::Duration};

#[tokio::test]
async fn test_produce_string_records() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let test_topic = KafkaTest::get_random_name();
    admin
        .create_topic(&test_topic, 1, 1, false)
        .await
        .expect("Unable to create test topic");

    let parser = Arc::new(Parser::new(None));
    let sut: KafkaProducer = KafkaProducer::new(&cluster_config, parser);

    // act — produce 5 string records
    for i in 0..5_u32 {
        sut.produce(
            &test_topic,
            &format!("key-{i}"),
            Some(&format!("value-{i}")),
            ParserMode::String,
        )
        .await
        .expect("produce failed");
    }

    // assert — consume them back using a raw rdkafka consumer
    let consumer: StreamConsumer = test_fixture.build_kafka_client();
    consumer.subscribe(&[test_topic.as_str()]).expect("Unable to subscribe");

    let mut received = Vec::new();
    let deadline = tokio::time::Instant::now() + Duration::from_secs(30);
    while received.len() < 5 {
        assert!(tokio::time::Instant::now() < deadline, "Timed out waiting for messages");
        let msg = tokio::time::timeout(Duration::from_secs(5), consumer.stream().next())
            .await
            .expect("timeout")
            .expect("stream ended")
            .expect("kafka error");
        let key = msg
            .key()
            .and_then(|b| std::str::from_utf8(b).ok())
            .unwrap_or("")
            .to_string();
        let payload = msg
            .payload()
            .and_then(|b| std::str::from_utf8(b).ok())
            .unwrap_or("")
            .to_string();
        received.push((key, payload));
    }

    received.sort();
    for i in 0..5_u32 {
        assert!(
            received.contains(&(format!("key-{i}"), format!("value-{i}"))),
            "Missing record for key-{i}"
        );
    }
}

#[tokio::test]
async fn test_produce_tombstone() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let test_topic = KafkaTest::get_random_name();
    admin
        .create_topic(&test_topic, 1, 1, false)
        .await
        .expect("Unable to create test topic");

    let parser = Arc::new(Parser::new(None));
    let sut: KafkaProducer = KafkaProducer::new(&cluster_config, parser);

    // act — produce a tombstone (None payload)
    let result: Result<(), _> = sut
        .produce(&test_topic, "tombstone-key", None, ParserMode::String)
        .await;

    // assert — tombstone must not error
    assert!(result.is_ok(), "Tombstone produce failed: {:?}", result.err());

    // verify the tombstone arrives with null payload
    let consumer: StreamConsumer = test_fixture.build_kafka_client();
    consumer.subscribe(&[test_topic.as_str()]).expect("Unable to subscribe");
    let msg = tokio::time::timeout(Duration::from_secs(15), consumer.stream().next())
        .await
        .expect("timeout waiting for tombstone message")
        .expect("stream ended")
        .expect("kafka error");

    assert!(msg.payload().is_none(), "Expected null payload for tombstone");
    assert_eq!(
        msg.key().and_then(|b| std::str::from_utf8(b).ok()).unwrap_or(""),
        "tombstone-key"
    );
}

#[tokio::test]
async fn test_produce_to_multiple_partitions() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let test_topic = KafkaTest::get_random_name();
    let num_partitions = 4_i32;
    admin
        .create_topic(&test_topic, num_partitions, 1, false)
        .await
        .expect("Unable to create test topic");

    let parser = Arc::new(Parser::new(None));
    let sut: KafkaProducer = KafkaProducer::new(&cluster_config, parser);

    // act — produce enough records that (by hash) they land on different partitions
    let n = 20_u32;
    for i in 0..n {
        sut.produce(
            &test_topic,
            &format!("k-{i}"),
            Some(&format!("v-{i}")),
            ParserMode::String,
        )
        .await
        .expect("produce failed");
    }

    // BaseProducer is async/buffered — wait for the background thread to flush all records
    tokio::time::sleep(Duration::from_secs(3)).await;

    // assert — verify total offset across all partitions equals n
    let offsets = admin
        .get_last_offsets(&[&test_topic])
        .await
        .expect("get_last_offsets failed");
    let total: i64 = offsets[&test_topic].iter().map(|po| po.offset).sum();
    assert_eq!(
        total, n as i64,
        "Expected {n} records spread across partitions, got {total}"
    );
}

#[tokio::test]
async fn test_produce_and_consume_via_topic_store() {
    // arrange
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let test_topic = KafkaTest::get_random_name();
    admin
        .create_topic(&test_topic, 1, 1, false)
        .await
        .expect("Unable to create test topic");

    let parser = Arc::new(Parser::new(None));
    let sut: KafkaProducer = KafkaProducer::new(&cluster_config, parser.clone());

    // produce 3 records
    for i in 0..3_u32 {
        sut.produce(
            &test_topic,
            &format!("key-{i}"),
            Some(&format!(r#"{{"id":{i}}}"#)),
            ParserMode::String,
        )
        .await
        .expect("produce failed");
    }

    // consume via KafkaConsumer + TopicStore and verify the store receives the records
    let store = Arc::new(SqliteStore::new(Duration::from_secs(30)));
    let topic_store = TopicStore::from_record_store(store, parser, &cluster_config.id, &test_topic);

    let consumer_config = crate::core::consumer::types::ConsumerConfiguration {
        compactify: false,
        consumer_start_config: crate::core::consumer::types::ConsumerOffsetConfiguration::Beginning,
    };

    let error_flag = std::sync::Arc::new(std::sync::Mutex::new(false));
    let error_flag_clone = error_flag.clone();

    let kafka_consumer = crate::core::consumer::KafkaConsumer::new(
        &cluster_config,
        &test_topic,
        topic_store,
        Arc::new(move |err| {
            eprintln!("consumer error: {:?}", err);
            *error_flag_clone.lock().unwrap() = true;
        }),
        test_fixture.tmo,
    );

    kafka_consumer
        .start(&consumer_config)
        .await
        .expect("consumer start failed");

    // poll until we have 3 records or time out
    let deadline = tokio::time::Instant::now() + Duration::from_secs(30);
    loop {
        tokio::time::sleep(Duration::from_millis(200)).await;
        let state = kafka_consumer
            .get_consumer_state()
            .await
            .expect("get_consumer_state failed");
        if state.record_count >= 3 {
            break;
        }
        assert!(
            tokio::time::Instant::now() < deadline,
            "Timed out waiting for 3 records in store"
        );
    }

    kafka_consumer.stop().await.expect("consumer stop failed");

    assert!(!*error_flag.lock().unwrap(), "Consumer reported an error");
    let state = kafka_consumer
        .get_consumer_state()
        .await
        .expect("get_consumer_state failed");
    assert_eq!(state.record_count, 3);
    assert!(!state.is_running);
}
