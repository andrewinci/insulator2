use log::debug;

use crate::lib::{ ConsumerGroupInfo, TopicInfo };

use super::{ error::Result, AppState };

#[tauri::command]
pub async fn list_topics(
    cluster_id: String,
    force: Option<bool>,
    state: tauri::State<'_, AppState>
) -> Result<Vec<TopicInfo>> {
    debug!("Retrieve the list of topics");
    let cluster = state.get_cluster_by_id(&cluster_id).await;
    Ok(cluster.admin_client.list_topics(force.unwrap_or(false)).await?)
}

#[tauri::command]
pub async fn create_topic(
    cluster_id: String,
    topic_name: String,
    partitions: i32,
    isr: i32,
    compacted: bool,
    state: tauri::State<'_, AppState>
) -> Result<()> {
    debug!("Create new topic");
    let cluster = state.get_cluster_by_id(&cluster_id).await;
    Ok(cluster.admin_client.create_topic(&topic_name, partitions, isr, compacted).await?)
}

#[tauri::command]
pub async fn list_consumer_groups(cluster_id: String, state: tauri::State<'_, AppState>) -> Result<Vec<String>> {
    debug!("Retrieve the list of consumer groups");
    let cluster = state.get_cluster_by_id(&cluster_id).await;
    Ok(cluster.admin_client.list_consumer_groups()?)
}

#[tauri::command]
pub async fn describe_consumer_groups(
    cluster_id: String,
    consumer_group_name: String,
    state: tauri::State<'_, AppState>
) -> Result<ConsumerGroupInfo> {
    debug!("Describe consumer group");
    let cluster = state.get_cluster_by_id(&cluster_id).await;
    Ok(cluster.admin_client.describe_consumer_group(&consumer_group_name).await?)
}