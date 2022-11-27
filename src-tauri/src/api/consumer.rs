use log::trace;

use crate::lib::{
    consumer::{types::ConsumerState, Consumer, ConsumerOffsetConfiguration},
    record_store::types::ExportOptions,
};

use super::{error::Result, types::GetPageResponse, AppState};

#[tauri::command]
pub async fn start_consumer(
    cluster_id: &str,
    topic: &str,
    offset_config: ConsumerOffsetConfiguration,
    state: tauri::State<'_, AppState>,
) -> Result<()> {
    let consumer = state.get_cluster(cluster_id).await.get_consumer(topic).await;
    Ok(consumer.start(&offset_config).await?)
}

#[tauri::command]
pub async fn get_consumer_state(
    cluster_id: &str,
    topic: &str,
    state: tauri::State<'_, AppState>,
) -> Result<ConsumerState> {
    let consumer = state.get_cluster(cluster_id).await.get_consumer(topic).await;
    Ok(consumer.get_consumer_state().await?)
}

#[tauri::command]
pub async fn stop_consumer(cluster_id: &str, topic: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    let consumer = state.get_cluster(cluster_id).await.get_consumer(topic).await;
    Ok(consumer.stop().await?)
}

#[tauri::command]
pub async fn get_records_page(
    cluster_id: &str,
    topic: &str,
    page_number: usize,
    query: Option<&str>,
    state: tauri::State<'_, AppState>,
) -> Result<GetPageResponse> {
    trace!("Get records page");
    const PAGE_SIZE: usize = 20;
    let cluster = state.get_cluster(cluster_id).await;
    let topic_store = cluster.get_topic_store(topic).await;
    let records_count = topic_store.get_size(query)?;
    Ok(GetPageResponse {
        records: topic_store.get_records(query, (page_number * PAGE_SIZE) as i64, PAGE_SIZE as i64)?,
        next_page: if (records_count as i64 - (PAGE_SIZE * page_number) as i64) > 0 {
            Some(page_number + 1)
        } else {
            None
        },
        prev_page: if page_number >= 1 { Some(page_number - 1) } else { None },
    })
}

#[tauri::command]
pub async fn export_records(
    cluster_id: &str,
    topic: &str,
    options: ExportOptions,
    state: tauri::State<'_, AppState>,
) -> Result<()> {
    let store = state.get_cluster(cluster_id).await.get_topic_store(topic).await;
    Ok(store.export_records(&options)?)
}
