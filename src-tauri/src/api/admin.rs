use log::debug;

use crate::lib::TopicInfo;

use super::{ error::{ Result }, AppState };

#[tauri::command]
pub async fn list_topics(cluster_id: String, state: tauri::State<'_, AppState>) -> Result<Vec<TopicInfo>> {
    debug!("Retrieve the list of topics");
    let cluster = state.get_cluster_by_id(&cluster_id).await;
    Ok(cluster.admin_client.list_topics()?)
}