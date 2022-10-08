use std::{ collections::HashMap, sync::{ Arc } };
use futures::lock::Mutex;
use log::{ warn, debug };

use super::error::Result;
use crate::{
    kafka::consumer::{
        parser::{ StringParser, AvroParser, RecordParser },
        types::{ ConsumerConfig, ConsumerInfo, ConsumerState, KafkaRecord },
        Consumer,
        GenericConsumer,
    },
    schema_registry::CachedSchemaRegistry,
    api::error::TauriError,
};

#[derive(Default)]
pub struct AppConsumers {
    pub consumer_handles: Arc<Mutex<HashMap<ConsumerInfo, Consumer>>>,
}

#[tauri::command]
pub async fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, AppConsumers>,
    _app: tauri::AppHandle
) -> Result<()> {
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: config.topic.clone(),
    };

    if state.consumer_handles.clone().lock().await.contains_key(&consumer_info) {
        warn!("Start consumer invoked twice for the same cluster/topic tuple. Ignoring.");
        return Ok(());
    }

    let avro_parser = (if config.use_avro {
        if let Some(ref schema_registry_config) = config.cluster.schema_registry {
            let schema_registry = CachedSchemaRegistry::new(
                schema_registry_config.endpoint.clone(),
                &schema_registry_config.username,
                &schema_registry_config.password
            );
            Ok(Some(AvroParser::new(Box::new(schema_registry))))
        } else {
            Err(TauriError {
                error_type: "Unable to use avro".into(),
                message: "Missing schema registry configuration".into(),
            })
        }
    } else {
        Ok(None)
    })?;

    let parser: Box<dyn RecordParser + Send + Sync> = match avro_parser {
        Some(parser) => Box::new(parser),
        None => Box::new(StringParser::new()),
    };
    //todo: notifications
    let consumer = Consumer::new(&config, parser, None);
    consumer.start().await?;
    // add consumer to the list of running consumers
    state.consumer_handles.lock().await.insert(consumer_info, consumer);
    debug!("New consumer started");
    Ok(())
}

#[tauri::command]
pub async fn get_consumer_state(
    consumer: ConsumerInfo,
    state: tauri::State<'_, AppConsumers>
) -> Result<ConsumerState> {
    if let Some(consumer) = state.consumer_handles.lock().await.get(&consumer) {
        Ok(consumer.get_state().await)
    } else {
        Ok(ConsumerState { is_running: false, record_count: 0 })
    }
}

#[tauri::command]
pub async fn stop_consumer(consumer: ConsumerInfo, state: tauri::State<'_, AppConsumers>) -> Result<()> {
    let consumer_info = consumer;
    let mut handles = state.consumer_handles.lock().await;
    if let Some(consumer) = handles.get(&consumer_info) {
        consumer.stop().await;
        handles.remove(&consumer_info);
        debug!("Consumer stopped and removed");
        Ok(())
    } else {
        debug!("Consumer {:?} to stop not found", consumer_info);
        Ok(())
    }
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