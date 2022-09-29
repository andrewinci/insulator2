use std::time::Duration;
use rdkafka::consumer::Consumer;
use serde::{ Serialize, Deserialize };

use crate::configuration::{ Cluster };
use crate::error::Result;

use super::consumer_client::create_consumer;

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