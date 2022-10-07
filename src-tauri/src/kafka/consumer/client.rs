use super::{
    parser::AvroParser,
    setup_consumer::setup_consumer,
    types::{ AppConsumers, ConsumeFrom, ConsumerConfig, ConsumerInfo, KafkaRecord },
};
use crate::{
    api::notify_error,
    configuration::Cluster,
    kafka::error::{ Error, Result },
    schema_registry::{ BasicAuth, CachedSchemaRegistry, ReqwestClient },
};
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

    // spawn the consumer loop
    // add the consumer handle to the list of handles
    state.consumer_handles
        .lock()
        .unwrap()
        .insert(
            consumer_info,
            spawn(async move {
                let consumer = setup_consumer(&config);
                let avro_parser = build_avro_parser(&config.cluster).unwrap();
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

fn build_avro_parser(cluster: &Cluster) -> Result<AvroParser<CachedSchemaRegistry<ReqwestClient>>> {
    let schema_registry = cluster.schema_registry.as_ref().ok_or_else(|| Error::AvroParse {
        msg: "Unable to use avro parsing without a schema registry configuration".into(),
    })?;
    let http_client = ReqwestClient::new(Some(10));
    let client = CachedSchemaRegistry::new(
        schema_registry.endpoint.clone(),
        Some(BasicAuth {
            username: schema_registry.clone().username.unwrap(),
            password: Some(schema_registry.clone().password.unwrap()),
        }),
        http_client
    );
    Ok(AvroParser::new(client))
}

async fn handle_consumed_message(
    msg: OwnedMessage,
    config: &ConsumerConfig,
    avro_parser: &AvroParser<CachedSchemaRegistry<ReqwestClient>>,
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