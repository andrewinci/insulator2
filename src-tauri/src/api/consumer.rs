use super::error::{ Result };
use crate::kafka::{ self, consumer::types::{ AppConsumers, ConsumerConfig, ConsumerInfo, ConsumerState, KafkaRecord } };

#[tauri::command]
pub async fn get_consumer_state(
    consumer: ConsumerInfo,
    state: tauri::State<'_, AppConsumers>
) -> Result<ConsumerState> {
    let is_running = state.consumer_handles.lock().unwrap().get(&consumer).is_some();
    let record_count = state.records_state
        .lock()
        .unwrap()
        .get(&consumer)
        .map(|r| r.len())
        .unwrap_or(0);
    Ok(ConsumerState {
        is_running,
        record_count,
    })
}

#[tauri::command]
pub async fn stop_consumer(consumer: ConsumerInfo, state: tauri::State<'_, AppConsumers>) -> Result<()> {
    if let Some(handle) = state.consumer_handles.lock().unwrap().remove(&consumer) {
        handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn get_record(
    consumer: ConsumerInfo,
    index: usize,
    state: tauri::State<'_, AppConsumers>
) -> Result<Option<KafkaRecord>> {
    if let Some(records) = state.records_state.lock().unwrap().get(&consumer) {
        if records.len() <= index { Ok(None) } else { Ok(Some(records[index].clone())) }
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, AppConsumers>,
    app: tauri::AppHandle
) -> Result<()> {
    kafka::consumer::start_consumer(config, state, app)?;
    Ok(())
}