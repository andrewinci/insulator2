use crate::lib::{
    parser::{Parser, ParserMode, RecordParser},
    types::{ParsedKafkaRecord, RawKafkaRecord},
    Result,
};
use std::sync::Arc;

use super::app_store::AppStore;

pub struct TopicStore {
    cluster_id: String,
    topic_name: String,
    app_store: Arc<AppStore>,
    parser: Arc<RecordParser>,
}

impl TopicStore {
    pub async fn from_app_store(
        app_store: Arc<AppStore>,
        parser: Arc<RecordParser>,
        cluster_id: &str,
        topic_name: &str,
    ) -> Self {
        app_store
            .create_topic_table(cluster_id, topic_name)
            .await
            .unwrap_or_else(|_| {
                panic!(
                    "Unable to create the table to store the records from topic {}",
                    topic_name
                )
            });
        TopicStore {
            cluster_id: cluster_id.to_string(),
            topic_name: topic_name.to_string(),
            app_store: app_store.clone(),
            parser,
        }
    }

    pub async fn get_records(&self, offset: i64, limit: i64) -> Result<Vec<ParsedKafkaRecord>> {
        self.app_store
            .get_records(&self.cluster_id, &self.topic_name, offset, limit)
            .await
    }

    pub async fn insert_record(&self, record: &RawKafkaRecord) -> Result<()> {
        let parsed_record = if let Ok(avro_record) = self.parser.parse_record(record, ParserMode::Avro).await {
            Ok(avro_record)
        } else {
            self.parser.parse_record(record, ParserMode::String).await
        }?;
        self.app_store
            .insert_record(&self.cluster_id, &self.topic_name, &parsed_record)
            .await
    }

    pub async fn clear(&self) -> Result<()> {
        self.app_store.clear(&self.cluster_id, &self.topic_name).await
    }

    pub async fn get_size(&self) -> Result<usize> {
        self.app_store.get_size(&self.cluster_id, &self.topic_name).await
    }
}
