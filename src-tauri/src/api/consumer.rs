use futures::lock::Mutex;
use log::{ debug, warn };
use std::{ collections::HashMap, sync::Arc };

use super::{ error::Result, AppState };
use crate::{
    api::error::TauriError,
    kafka::consumer::{
        parser::{ AvroParser, RecordParser, StringParser },
        types::{ ConsumerConfig, ConsumerInfo, KafkaRecord },
        Consumer,
        GenericConsumer,
    },
    lib::{ ConsumerOffsetConfiguration, ConsumerState },
    schema_registry::CachedSchemaRegistry,
};

#[derive(Default)]
pub struct AppConsumers {
    pub consumer_handles: Arc<Mutex<HashMap<ConsumerInfo, Consumer>>>,
}

#[tauri::command]
pub async fn start_consumer(
    cluster_id: String,
    topic: String,
    offset_config: ConsumerOffsetConfiguration,
    state: tauri::State<'_, AppState>
) -> Result<()> {
    let consumer = state.get_cluster_by_id(&cluster_id).await.get_consumer(&topic).await;
    Ok(consumer.start(offset_config).await?)
}

#[tauri::command]
pub async fn get_consumer_state(
    cluster_id: String,
    topic: String,
    state: tauri::State<'_, AppState>
) -> Result<ConsumerState> {
    let consumer = state.get_cluster_by_id(&cluster_id).await.get_consumer(&topic).await;
    Ok(consumer.get_consumer_state().await)
}

#[tauri::command]
pub async fn stop_consumer(cluster_id: String, topic: String, state: tauri::State<'_, AppState>) -> Result<()> {
    let consumer = state.get_cluster_by_id(&cluster_id).await.get_consumer(&topic).await;
    Ok(consumer.stop().await?)
}

#[tauri::command]
pub async fn get_record(
    consumer: ConsumerInfo,
    index: usize,
    state: tauri::State<'_, AppConsumers>
) -> Result<Option<KafkaRecord>> {
    let consumer_info = consumer;
    let handles = state.consumer_handles.lock().await;
    if let Some(consumer) = handles.get(&consumer_info) {
        Ok(consumer.get_record(index).await)
    } else {
        warn!("Consumer {:?} not found", consumer_info);
        Ok(None)
    }
}