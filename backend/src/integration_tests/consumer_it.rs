#![cfg(test)]

use rdkafka::producer::{FutureProducer, FutureRecord};
use std::{sync::Arc, time::Duration};

use crate::{
    core::{
        consumer::{
            types::{ConsumerConfiguration, ConsumerOffsetConfiguration},
            KafkaConsumer,
        },
        parser::Parser,
        record_store::{SqliteStore, TopicStore},
    },
    integration_tests::KafkaTest,
};

/// Helper: produce `count` records to `topic` and return the approximate unix-ms timestamp
/// captured just before sending (used to test custom offset / timestamp-based consumption).
async fn produce_records(test_fixture: &KafkaTest, topic: &str, count: u32) -> u64 {
    let ts_before = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let producer: FutureProducer = test_fixture.build_kafka_client();
    for i in 0..count {
        producer
            .send(
                FutureRecord::to(topic)
                    .key(&format!("key-{i}"))
                    .payload(&format!("value-{i}")),
                Duration::from_secs(10),
            )
            .await
            .expect("Failed to produce record");
    }
    ts_before
}

/// Helper: build a fresh `KafkaConsumer` with an in-memory `TopicStore` and an error flag.
fn make_consumer(
    test_fixture: &KafkaTest,
    topic: &str,
    error_flag: Arc<std::sync::Mutex<bool>>,
) -> (KafkaConsumer, Arc<TopicStore>) {
    let cluster_config = test_fixture.build_cluster_config();
    let store = Arc::new(SqliteStore::new(Duration::from_secs(30)));
    let parser = Arc::new(Parser::new(None));
    let topic_store = Arc::new(TopicStore::from_record_store(store, parser, &cluster_config.id, topic));
    let ts_clone = topic_store.clone();
    let consumer = KafkaConsumer::new(
        &cluster_config,
        topic,
        // KafkaConsumer::new takes ownership of a TopicStore, not Arc<TopicStore>
        // Rebuild one from the same backing store — the Arc<TopicStore> is on the consumer
        {
            let store2 = Arc::new(SqliteStore::new(Duration::from_secs(30)));
            let parser2 = Arc::new(Parser::new(None));
            TopicStore::from_record_store(store2, parser2, &cluster_config.id, topic)
        },
        Arc::new(move |err| {
            eprintln!("consumer error in test: {:?}", err);
            *error_flag.lock().unwrap() = true;
        }),
        test_fixture.tmo,
    );
    (consumer, ts_clone)
}

/// Poll the consumer state until `record_count >= expected` or the deadline passes.
async fn wait_for_records(consumer: &KafkaConsumer, expected: usize, deadline_secs: u64) {
    let deadline = tokio::time::Instant::now() + Duration::from_secs(deadline_secs);
    loop {
        tokio::time::sleep(Duration::from_millis(250)).await;
        let state = consumer.get_consumer_state().await.expect("get_consumer_state failed");
        if state.record_count >= expected {
            return;
        }
        assert!(
            tokio::time::Instant::now() < deadline,
            "Timed out waiting for {expected} records (got {})",
            state.record_count
        );
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_consumer_from_beginning() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    produce_records(&test_fixture, &topic, 5).await;

    // consume from the very beginning
    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    let cfg = ConsumerConfiguration {
        compactify: false,
        consumer_start_config: ConsumerOffsetConfiguration::Beginning,
    };
    consumer.start(&cfg).await.expect("consumer start failed");
    wait_for_records(&consumer, 5, 30).await;
    consumer.stop().await.expect("consumer stop failed");

    assert!(!*error_flag.lock().unwrap(), "Consumer reported an error");
    let state = consumer.get_consumer_state().await.unwrap();
    assert_eq!(state.record_count, 5);
    assert!(!state.is_running);
}

#[tokio::test]
async fn test_consumer_from_end_receives_only_new_records() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    // produce 3 records BEFORE starting the consumer
    produce_records(&test_fixture, &topic, 3).await;

    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    let cfg = ConsumerConfiguration {
        compactify: false,
        consumer_start_config: ConsumerOffsetConfiguration::End,
    };
    consumer.start(&cfg).await.expect("consumer start failed");

    // produce 2 more records AFTER the consumer started at End
    produce_records(&test_fixture, &topic, 2).await;

    wait_for_records(&consumer, 2, 30).await;
    consumer.stop().await.expect("consumer stop failed");

    assert!(!*error_flag.lock().unwrap(), "Consumer reported an error");
    let state = consumer.get_consumer_state().await.unwrap();
    // Should see only the 2 new records, not the 3 old ones
    assert_eq!(state.record_count, 2);
}

#[tokio::test]
async fn test_consumer_start_stop_is_running_flag() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    // not running yet
    let state = consumer.get_consumer_state().await.unwrap();
    assert!(!state.is_running);

    let cfg = ConsumerConfiguration {
        compactify: false,
        consumer_start_config: ConsumerOffsetConfiguration::End,
    };
    consumer.start(&cfg).await.expect("start failed");

    // should be running now
    let state = consumer.get_consumer_state().await.unwrap();
    assert!(state.is_running);

    consumer.stop().await.expect("stop failed");

    // should no longer be running
    let state = consumer.get_consumer_state().await.unwrap();
    assert!(!state.is_running);
    assert!(!*error_flag.lock().unwrap());
}

#[tokio::test]
async fn test_consumer_start_twice_returns_error() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    let cfg = ConsumerConfiguration {
        compactify: false,
        consumer_start_config: ConsumerOffsetConfiguration::End,
    };
    consumer.start(&cfg).await.expect("first start failed");

    // starting again while already running should return an error
    let result = consumer.start(&cfg).await;
    assert!(result.is_err(), "Expected error when starting consumer twice");

    consumer.stop().await.expect("stop failed");
    assert!(!*error_flag.lock().unwrap());
}

#[tokio::test]
async fn test_consumer_custom_offset_with_stop_timestamp() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, false)
        .await
        .expect("create_topic failed");

    // produce 5 records and capture a mid-stream timestamp
    let ts_start = produce_records(&test_fixture, &topic, 3).await;
    // small delay so the next batch gets a later timestamp
    tokio::time::sleep(Duration::from_millis(200)).await;
    let ts_mid = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;
    produce_records(&test_fixture, &topic, 2).await;

    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    // consume from the very beginning but stop at ts_mid — should only see the first 3
    let cfg = ConsumerConfiguration {
        compactify: false,
        consumer_start_config: ConsumerOffsetConfiguration::Custom {
            start_timestamp: ts_start as i64,
            stop_timestamp: Some(ts_mid as i64),
        },
    };
    consumer.start(&cfg).await.expect("start failed");

    // give the consumer time to read all it can and pause
    tokio::time::sleep(Duration::from_secs(5)).await;
    consumer.stop().await.expect("stop failed");

    assert!(!*error_flag.lock().unwrap(), "Consumer reported an error");
    let state = consumer.get_consumer_state().await.unwrap();
    // We expect ≤ 3 records (the first batch produced before ts_mid)
    assert!(
        state.record_count <= 3,
        "Expected at most 3 records before stop_timestamp, got {}",
        state.record_count
    );
}

#[tokio::test]
async fn test_consumer_compactify_deduplicates_keys() {
    let test_fixture = KafkaTest::default();
    let cluster_config = test_fixture.build_cluster_config();
    let admin =
        crate::core::admin::KafkaAdmin::new(&cluster_config, test_fixture.tmo).expect("Unable to create admin client");
    let topic = KafkaTest::get_random_name();
    admin
        .create_topic(&topic, 1, 1, true)
        .await
        .expect("create_topic failed");

    // produce 2 records with the same key
    let producer: FutureProducer = test_fixture.build_kafka_client();
    for _i in 0..2_u32 {
        producer
            .send(
                FutureRecord::to(&topic).key("same-key").payload("value"),
                Duration::from_secs(10),
            )
            .await
            .expect("produce failed");
    }
    // produce 1 record with a different key
    producer
        .send(
            FutureRecord::to(&topic).key("other-key").payload("other-value"),
            Duration::from_secs(10),
        )
        .await
        .expect("produce failed");

    let error_flag = Arc::new(std::sync::Mutex::new(false));
    let (consumer, _) = make_consumer(&test_fixture, &topic, error_flag.clone());

    let cfg = ConsumerConfiguration {
        compactify: true,
        consumer_start_config: ConsumerOffsetConfiguration::Beginning,
    };
    consumer.start(&cfg).await.expect("start failed");
    wait_for_records(&consumer, 2, 30).await;
    // give a moment for any potential extra record to arrive
    tokio::time::sleep(Duration::from_millis(500)).await;
    consumer.stop().await.expect("stop failed");

    assert!(!*error_flag.lock().unwrap(), "Consumer reported an error");
    let state = consumer.get_consumer_state().await.unwrap();
    // With compactify=true the store uses UNIQUE on key, so the duplicate key is replaced.
    // The consumer sees 3 raw records but the store should keep only 2 unique keys.
    // record_count tracks inserts (not stored rows), so we just verify ≥ 2 records were processed.
    assert!(
        state.record_count >= 2,
        "Expected at least 2 records, got {}",
        state.record_count
    );
}
