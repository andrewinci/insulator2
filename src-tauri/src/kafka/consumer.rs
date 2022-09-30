mod client;
mod state;
pub use client::create_consumer;
use futures::StreamExt;
use rdkafka::{
    TopicPartitionList,
    consumer::{ Consumer, StreamConsumer },
    Message,
    message::OwnedMessage,
};
pub use state::ConsumerState;

use std::{ sync::{ Arc, Mutex }, collections::HashMap };

use serde::{ Serialize, Deserialize };
use tauri::{ async_runtime::spawn, Manager, AppHandle };

use crate::{ configuration::Cluster, error::{ Result, TauriError } };

use self::state::{ ConsumerInfo, KafkaRecord };

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerConfig {
    cluster: Cluster,
    topic: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Event {
    consumer: ConsumerInfo,
    records_count: usize,
}

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, ConsumerState>,
    app: tauri::AppHandle
) -> Result<()> {
    let topic = config.topic.clone();
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: topic.clone(),
    };
    let records_state = state.records_state.clone();

    // check if the consumer is already running
    if state.consumer_handles.lock().unwrap().contains_key(&consumer_info) {
        return Err(TauriError {
            error_type: "Kafka consumer".into(),
            message: format!("Consumer for topic \"{}\" is already running", &topic),
        });
    }

    // init the records state
    records_state
        .lock()
        .unwrap()
        .insert(consumer_info.clone(), Vec::<_>::new());

    // spawn the container
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info.clone(),
            spawn(async move {
                let consumer = setup_consumer(&config).expect("msg");
                // consumer loop
                loop {
                    // todo: handle the Err result
                    if let Some(Ok(raw_msg)) = consumer.stream().next().await {
                        let record = parse_record(raw_msg.detach()).expect("msg");
                        let len = push_record(record, records_state.clone(), &consumer_info).await;
                        notify_client(len, &app, &consumer_info).await;
                    }
                }
            })
        );
    Ok(())
}

#[tauri::command]
pub async fn stop_consumer(
    consumer: ConsumerInfo,
    state: tauri::State<'_, ConsumerState>
) -> Result<()> {
    if let Some(consumer_handle) = state.consumer_handles.lock().unwrap().get(&consumer) {
        // maybe there is a cleaner way
        consumer_handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn get_record(
    consumer: ConsumerInfo,
    index: usize,
    state: tauri::State<'_, ConsumerState>
) -> Result<Option<KafkaRecord>> {
    if let Some(records) = state.records_state.lock().unwrap().get(&consumer) {
        if records.len() <= index { Ok(None) } else { Ok(Some(records[index].clone())) }
    } else {
        Ok(None)
    }
}

fn setup_consumer(config: &ConsumerConfig) -> Result<StreamConsumer> {
    // build the kafka consumer
    let consumer = create_consumer(&config.cluster)?;
    let mut assignment = TopicPartitionList::new();
    assignment.add_partition_offset(&config.topic, 0, rdkafka::Offset::Offset(0))?;
    consumer.assign(&assignment)?;
    Ok(consumer)
}

async fn push_record(
    record: KafkaRecord,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>,
    consumer_info: &ConsumerInfo
) -> usize {
    let mut records_map = records_state.lock().unwrap();
    let records = records_map.get_mut(consumer_info).expect("The map record was created above");
    records.push(record);
    records.len()
}

async fn notify_client(records_count: usize, app: &AppHandle, consumer_info: &ConsumerInfo) {
    app.app_handle()
        .emit_all(format!("consumer_{}", consumer_info.topic.clone()).as_str(), Event {
            consumer: consumer_info.clone(),
            records_count,
        })
        .expect("unable to send a notification to the frontend");
}

fn parse_string(v: Option<&[u8]>) -> std::result::Result<Option<String>, String> {
    match v {
        Some(v) =>
            String::from_utf8(Vec::from(v))
                .map(Some)
                .map_err(|_| "unable to parse the string to utf8".into()),
        None => Ok(None),
    }
}

fn parse_record(msg: OwnedMessage) -> std::result::Result<KafkaRecord, String> {
    Ok(KafkaRecord {
        key: parse_string(msg.key()).map_err(|_| "Unable to map the key")?,
        value: parse_string(msg.payload()).map_err(|_| "Unable to map the value")?,
    })
}

#[test]
fn parse_empty_array_to_string() {
    let vec = vec![];
    let res = parse_string(Some(&vec));
    assert_eq!(res, Ok(Some("".into())))
}
#[test]
fn parse_none_to_string() {
    let res = parse_string(None);
    assert_eq!(res, Ok(None))
}

#[test]
fn parse_invalid_to_string() {
    let vec: Vec<u8> = vec![0x00, 0xff];
    let res = parse_string(Some(&vec));
    assert_eq!(res, Err("unable to parse the string to utf8".into()))
}