use crate::lib::{
    parser::{Parser, ParserMode, RecordParser},
    types::{ParsedKafkaRecord, RawKafkaRecord},
    Result,
};
use std::sync::Arc;

use super::raw_store::RawStore;

pub struct TopicRecordStore {
    cluster_id: String,
    topic_name: String,
    raw_store: Arc<RawStore>,
    parser: Arc<RecordParser>,
}

impl TopicRecordStore {
    pub async fn from_raw_store(
        raw_store: Arc<RawStore>,
        parser: Arc<RecordParser>,
        cluster_id: &str,
        topic_name: &str,
    ) -> Self {
        raw_store
            .create_topic_table(cluster_id, topic_name)
            .await
            .unwrap_or_else(|_| {
                panic!(
                    "Unable to create the table to store the records from topic {}",
                    topic_name
                )
            });
        TopicRecordStore {
            cluster_id: cluster_id.to_string(),
            topic_name: topic_name.to_string(),
            raw_store: raw_store.clone(),
            parser,
        }
    }

    pub async fn get_records(&self, offset: i64, limit: i64) -> Result<Vec<ParsedKafkaRecord>> {
        self.raw_store
            .get_records(&self.cluster_id, &self.topic_name, offset, limit)
            .await
    }

    pub async fn insert_record(&self, record: &RawKafkaRecord) -> Result<()> {
        let parsed_record = if let Ok(avro_record) = self.parser.parse_record(record, ParserMode::Avro).await {
            Ok(avro_record)
        } else {
            self.parser.parse_record(record, ParserMode::String).await
        }?;
        self.raw_store
            .insert_record(&self.cluster_id, &self.topic_name, &parsed_record)
            .await
    }

    pub async fn clear(&self) -> Result<()> {
        self.raw_store.clear(&self.cluster_id, &self.topic_name).await
    }

    pub async fn get_size(&self) -> Result<usize> {
        self.raw_store.get_size(&self.cluster_id, &self.topic_name).await
    }
}
