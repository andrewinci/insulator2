use log::debug;

use crate::lib::admin::{Admin, ConsumerGroupInfo, Topic, TopicInfo};

use super::{error::Result, AppState};

#[tauri::command]
pub async fn list_topics(cluster_id: &str, state: tauri::State<'_, AppState>) -> Result<Vec<Topic>> {
    debug!("Retrieve the list of topics");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster.admin_client.list_topics()?)
}

#[tauri::command]
pub async fn get_topic_info(cluster_id: &str, topic_name: &str, state: tauri::State<'_, AppState>) -> Result<TopicInfo> {
    debug!("Retrieve topic info for {}", topic_name);
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster.admin_client.get_topic_info(topic_name).await?)
}

#[tauri::command]
pub async fn create_topic(
    cluster_id: &str,
    topic_name: &str,
    partitions: i32,
    isr: i32,
    compacted: bool,
    state: tauri::State<'_, AppState>,
) -> Result<()> {
    debug!("Create new topic");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster
        .admin_client
        .create_topic(topic_name, partitions, isr, compacted)
        .await?)
}

#[tauri::command]
pub async fn list_consumer_groups(cluster_id: &str, state: tauri::State<'_, AppState>) -> Result<Vec<String>> {
    debug!("Retrieve the list of consumer groups");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster.admin_client.list_consumer_groups()?)
}

#[tauri::command]
pub async fn describe_consumer_group(
    cluster_id: &str,
    consumer_group_name: &str,
    state: tauri::State<'_, AppState>,
) -> Result<ConsumerGroupInfo> {
    debug!("Describe consumer group");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster.admin_client.describe_consumer_group(consumer_group_name)?)
}
