use std::collections::HashMap;

use log::debug;

use crate::lib::{
    admin::{ConsumerGroupInfo, PartitionOffset, Topic, TopicInfo},
    consumer::types::ConsumerSessionConfiguration,
};

use super::{error::ApiResult, AppState};

#[tauri::command]
pub async fn list_topics(cluster_id: &str, state: tauri::State<'_, AppState>) -> ApiResult<Vec<Topic>> {
    debug!("Retrieve the list of topics");
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_admin_client.list_topics().await?)
}

#[tauri::command]
pub async fn get_topic_info(
    cluster_id: &str,
    topic_name: &str,
    state: tauri::State<'_, AppState>,
) -> ApiResult<TopicInfo> {
    debug!("Retrieve topic info for {}", topic_name);
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_admin_client.get_topic_info(topic_name).await?)
}

#[tauri::command]
pub async fn delete_topic(cluster_id: &str, topic_name: &str, state: tauri::State<'_, AppState>) -> ApiResult<()> {
    debug!("Deleting topic {}", topic_name);
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_admin_client.delete_topic(topic_name).await?)
}

#[tauri::command]
pub async fn create_topic(
    cluster_id: &str,
    topic_name: &str,
    partitions: i32,
    isr: i32,
    compacted: bool,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    debug!("Create new topic");
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster
        .kafka_admin_client
        .create_topic(topic_name, partitions, isr, compacted)
        .await?)
}

#[tauri::command]
pub async fn list_consumer_groups(cluster_id: &str, state: tauri::State<'_, AppState>) -> ApiResult<Vec<String>> {
    debug!("Retrieve the list of consumer groups");
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_admin_client.list_consumer_groups()?)
}

#[tauri::command]
pub async fn describe_consumer_group(
    cluster_id: &str,
    consumer_group_name: &str,
    ignore_cache: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> ApiResult<ConsumerGroupInfo> {
    debug!("Describe consumer group");
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster
        .kafka_admin_client
        .describe_consumer_group(consumer_group_name, ignore_cache.unwrap_or(false))
        .await?)
}

#[tauri::command]
pub async fn get_consumer_group_state(
    cluster_id: &str,
    consumer_group_name: &str,
    state: tauri::State<'_, AppState>,
) -> ApiResult<String> {
    debug!("Get consumer group");
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster
        .kafka_admin_client
        .get_consumer_group_state(consumer_group_name)?)
}

#[tauri::command]
pub async fn set_consumer_group(
    cluster_id: &str,
    consumer_group_name: &str,
    topics: Vec<&str>,
    offset_config: ConsumerSessionConfiguration,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    debug!("Create consumer group {}", consumer_group_name);
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster
        .kafka_admin_client
        .set_consumer_group(consumer_group_name, &topics, &offset_config)
        .await?)
}

#[tauri::command]
pub async fn get_last_offsets(
    cluster_id: &str,
    topic_names: Vec<&str>,
    state: tauri::State<'_, AppState>,
) -> ApiResult<HashMap<String, Vec<PartitionOffset>>> {
    debug!("Get last offset for topics {:?}", topic_names);
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_admin_client.get_last_offsets(&topic_names).await?)
}

#[tauri::command]
pub async fn delete_consumer_group(
    cluster_id: &str,
    consumer_group_name: &str,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    debug!("Deleting consumer group {}", consumer_group_name);
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster
        .kafka_admin_client
        .delete_consumer_group(consumer_group_name)
        .await?)
}
