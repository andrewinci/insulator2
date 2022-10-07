use super::{
    parser::AvroParser,
    setup_consumer::setup_consumer,
    types::{ AppConsumers, ConsumeFrom, ConsumerConfig, ConsumerInfo, KafkaRecord },
};
use crate::{ api::notify_error, kafka::error::{ Error, Result }, schema_registry::CachedSchemaRegistry };
use futures::StreamExt;
use rdkafka::message::OwnedMessage;
use std::{ collections::HashMap, sync::{ Arc, Mutex } };
use tauri::async_runtime::spawn;

pub fn start_consumer(
    config: ConsumerConfig,
    state: tauri::State<'_, AppConsumers>,
    app: tauri::AppHandle
) -> Result<()> {
    let topic = config.topic.clone();
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: topic.clone(),
    };
    let records_state = state.records_state.clone();

    // check if the consumer is already running
    if state.consumer_handles.lock().unwrap().contains_key(&consumer_info) {
        return Err(Error::KafkaConsumer {
            msg: format!("Consumer for topic \"{}\" is already running", &topic),
        });
    }

    // init the records state
    records_state
        .lock()
        .unwrap()
        .insert(consumer_info.clone(), Vec::<_>::new());

    let schema_registry_client = CachedSchemaRegistry::new(&config.cluster.schema_registry.clone().unwrap());
    let avro_parser = AvroParser::new(schema_registry_client);
    // spawn the consumer loop
    // add the consumer handle to the list of handles
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info,
            spawn(async move {
                let consumer = setup_consumer(&config);
                match consumer {
                    Err(err) => { notify_error("Unable to setup the consumer".into(), err.to_string(), &app) }
                    // consumer loop
                    Ok(consumer) =>
                        loop {
                            match consumer.stream().next().await {
                                Some(Ok(msg)) => {
                                    match
                                        handle_consumed_message(
                                            msg.detach(),
                                            &config,
                                            &avro_parser,
                                            records_state.clone()
                                        ).await
                                    {
                                        Ok(_) => {
                                            continue;
                                        }
                                        Err(err) => {
                                            notify_error("Consumer error".into(), err.to_string(), &app);
                                            break; //todo: delete the consumer from the state
                                        }
                                    }
                                }
                                Some(Err(err)) => {
                                    notify_error("Consumer error".into(), err.to_string(), &app);
                                }
                                None => (),
                            }
                        }
                }
            })
        );
    Ok(())
}

async fn handle_consumed_message(
    msg: OwnedMessage,
    config: &ConsumerConfig,
    avro_parser: &AvroParser,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>
) -> Result<()> {
    let consumer_info = ConsumerInfo {
        cluster_id: config.cluster.id.clone(),
        topic: config.topic.clone(),
    };
    let record = if config.use_avro {
        avro_parser.parse_record(msg).await?
    } else {
        super::parser::parse_string_record(msg)?
    };
    // check if the record is beyond the consuming window
    // and skip if it is so
    if let ConsumeFrom::Custom { start_timestamp: _, stop_timestamp: Some(stop_timestamp) } = config.from {
        if let Some(current_timestamp) = record.timestamp {
            if stop_timestamp <= current_timestamp {
                // skip push_record into the consumer record_state
                //todo: disable consumption for the current partition
                return Ok(());
            }
        }
    }
    super::state::push_record(record, records_state.clone(), &consumer_info);
    Ok(())
}