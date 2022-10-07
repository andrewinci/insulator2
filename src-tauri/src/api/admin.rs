use super::error::{ Result };
use crate::{ configuration::Cluster, kafka::admin::{ list_topics, TopicInfo } };

#[tauri::command]
pub async fn list_topic(cluster: Cluster, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
    Ok(list_topics(&cluster, topic)?)
}