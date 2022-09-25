use std::time::Duration;
use rdkafka::types::RDKafkaMessage;
use rdkafka::{ consumer::Consumer, message::OwnedMessage, Message };
use rdkafka::TopicPartitionList;
use serde::{ Serialize, Deserialize };
use futures::stream::StreamExt;

use crate::configuration::model::{ Cluster };
mod consumer;

use consumer::create_consumer;
use crate::error::Result;

#[derive(Serialize, Deserialize, Debug)]
pub struct TopicInfo {
    name: String,
}

#[tauri::command]
pub async fn list_topics(cluster: Cluster) -> Result<Vec<TopicInfo>> {
    let topics: Vec<TopicInfo> = create_consumer(&cluster)?
        .fetch_metadata(None, Duration::from_secs(10))?
        .topics()
        .iter()
        .map(|t| TopicInfo { name: t.name().to_string() })
        .collect();
    Ok(topics)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ConsumerSetting {
    topic: String,
}

// #[derive(Default)]
// struct MyState {
//   s: std::sync::Mutex<String>,
//   t: std::sync::Mutex<std::collections::HashMap<String, String>>,
// }
// // remember to call `.manage(MyState::default())`
// #[tauri::command]
// async fn command_name(state: tauri::State<'_, MyState>) -> Result<(), String> {
//   *state.s.lock().unwrap() = "new string".into();
//   state.t.lock().unwrap().insert("key".into(), "value".into());
//   Ok(())
// }

#[derive(Debug, Serialize, Deserialize)]
struct KafkaRecord {
    #[serde(rename = "p")]
    partition: u64,
    #[serde(rename = "o")]
    offset: u64,
    key: String,
    value: String,
}

#[tauri::command]
pub async fn start_consume(cluster: Cluster, settings: ConsumerSetting) -> Result<bool> {
    let mut assignment: TopicPartitionList = TopicPartitionList::new();
    assignment.add_partition_offset(&settings.topic, 0, rdkafka::Offset::Offset(0))?;
    let consumer = create_consumer(&cluster)?;
    consumer.assign(&assignment)?;

    while let Some(Ok(v)) = consumer.stream().next().await {
        let record = v.detach().to_owned();
        println!("Result : {:?}", record.topic());
    }

    Ok(true)
}