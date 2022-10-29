use futures::future::join_all;
use log::{debug, warn};

use crate::lib::{
    consumer::{types::ConsumerState, Consumer, ConsumerOffsetConfiguration},
    parser::{Parser, ParserMode},
    types::{ParsedKafkaRecord, RawKafkaRecord},
    Cluster,
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
    Ok(consumer.get_consumer_state().await)
}

#[tauri::command]
pub async fn stop_consumer(cluster_id: &str, topic: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    let consumer = state.get_cluster(cluster_id).await.get_consumer(topic).await;
    Ok(consumer.stop().await?)
}

#[tauri::command]
pub async fn get_record(
    index: usize,
    cluster_id: &str,
    topic: &str,
    state: tauri::State<'_, AppState>,
) -> Result<Option<ParsedKafkaRecord>> {
    let cluster = state.get_cluster(cluster_id).await;
    let consumer = cluster.get_consumer(topic).await;
    match consumer.get_record(index).await {
        Some(r) => {
            let avro_record = cluster.parser.parse_record(&r, ParserMode::Avro).await;
            let parsed = match avro_record {
                Ok(res) => res,
                Err(_) => {
                    warn!("Unable to parse record with avro. Topic: {} Index : {}", topic, index);
                    cluster.parser.parse_record(&r, ParserMode::String).await?
                }
            };
            Ok(Some(parsed))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn get_records_page(
    cluster_id: &str,
    topic: &str,
    page_number: usize,
    state: tauri::State<'_, AppState>,
) -> Result<GetPageResponse> {
    debug!("Get records page");
    const PAGE_SIZE: usize = 100;
    let cluster = state.get_cluster(cluster_id).await;
    let consumer = cluster.get_consumer(topic).await;
    let consumer_state = consumer.get_consumer_state().await;

    //todo: pages should be handled upstream in the consumer
    let page = consumer.get_page(page_number).await;
    let parsed: Vec<_> = page
        .iter()
        .map(|r| async { to_parsed_record(&cluster, r).await })
        .collect();
    debug!("Retrieved and parsed {} records", parsed.len());
    Ok(GetPageResponse {
        records: join_all(parsed).await,
        next_page: if (consumer_state.record_count - PAGE_SIZE * page_number) > 0 {
            Some(page_number + 1)
        } else {
            None
        },
        prev_page: if page_number >= 1 { Some(page_number - 1) } else { None },
    })
}

async fn to_parsed_record(cluster: &Cluster, r: &RawKafkaRecord) -> ParsedKafkaRecord {
    if cluster.schema_registry_client.is_some() {
        let avro_record = cluster.parser.parse_record(r, ParserMode::Avro).await;
        match avro_record {
            Ok(res) => res,
            Err(_) => {
                warn!(
                    "Unable to parse record with avro. Topic: {}, Partition: {}, Offset : {}",
                    r.topic, r.partition, r.offset
                );
                cluster.parser.parse_record(r, ParserMode::String).await.unwrap()
            }
        }
    } else {
        cluster.parser.parse_record(r, ParserMode::String).await.unwrap()
    }
}
