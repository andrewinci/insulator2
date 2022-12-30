use crate::lib::Result;

use super::AppState;

#[tauri::command]
pub async fn produce_record(
    cluster_id: &str,
    topic: &str,
    key: &str,
    value: Option<&str>, // None would be a tombstone
    state: tauri::State<'_, AppState>,
) -> Result<()> {
    let cluster = state.get_cluster(cluster_id).await?;
    cluster.kafka_producer.produce(topic, key, value)
}
