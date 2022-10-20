use log::debug;

use crate::lib::admin::{Admin, ConsumerGroupInfo, TopicInfo};

use super::{error::Result, AppState};

#[tauri::command]
pub async fn list_topics(
    cluster_id: &str,
    force: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<TopicInfo>> {
    debug!("Retrieve the list of topics");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster.admin_client.list_topics(force.unwrap_or(false)).await?)
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
pub async fn list_consumer_groups(
    cluster_id: &str,
    force: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<String>> {
    debug!("Retrieve the list of consumer groups");
    let cluster = state.get_cluster(cluster_id).await;
    Ok(cluster
        .admin_client
        .list_consumer_groups(force.unwrap_or(false))
        .await?)
}

#[tauri::command]
pub async fn describe_consumer_group(
    cluster_id: &str,
    consumer_group_name: &str,
    use_cache: Option<bool>,
    state: tauri::State<'_, AppState>,
) -> Result<ConsumerGroupInfo> {
    debug!("Describe consumer group");
    let cluster = state.get_cluster(cluster_id).await;

    if use_cache == Some(true) {
        debug!("Retrieve the consumer group info from the cache");
        // let offsets: Vec<_> = (0..100).map(|n| TopicPartitionOffset {
        //     topic: "test_topic".into(),
        //     partition_id: n,
        //     offset: (n*1321) as i64,
        // }).collect();
        // return Ok(ConsumerGroupInfo {
        //     name: "Test consumer group".into(),
        //     state: "ACTIVE".into(),
        //     offsets,
        // });
    }
    Ok(cluster
        .admin_client
        .describe_consumer_group(consumer_group_name)
        .await?)
}
