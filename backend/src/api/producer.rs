use crate::lib::types::ParserMode;

use super::{error::ApiResult, AppState};

#[tauri::command]
pub async fn produce_record(
    cluster_id: &str,
    topic: &str,
    key: &str,
    value: Option<&str>, // None would be a tombstone
    mode: ParserMode,
    state: tauri::State<'_, AppState>,
) -> ApiResult<()> {
    let cluster = state.get_cluster(cluster_id).await?;
    Ok(cluster.kafka_producer.produce(topic, key, value, mode).await?)
}
