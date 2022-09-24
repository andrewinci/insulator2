use std::time::Duration;
use rdkafka::consumer::Consumer;
use serde::{ Serialize, Deserialize };

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