use std::sync::Arc;
use crate::lib::{Result, types::ParsedKafkaRecord};

use super::raw_store::RawStore;

pub struct TopicRecordStore {
    cluster_id: String,
    topic_name: String,
    raw_store: Arc<RawStore>,
}

impl TopicRecordStore {
    pub fn new(raw_store: Arc<RawStore>, cluster_id: &str, topic_name: &str) -> Self {
        TopicRecordStore {
            cluster_id: cluster_id.to_string(),
            topic_name: topic_name.to_string(),
            raw_store: raw_store.clone(),
        }
    }

    pub fn get_records(&self, max: i64) -> Result<Vec<ParsedKafkaRecord>> {
        self.raw_store.get_records(&self.cluster_id, &self.topic_name, max)
    }

    pub fn insert_record(&self, record: &ParsedKafkaRecord) -> Result<()> {
        self.raw_store
            .insert_record(&self.cluster_id, &self.topic_name, &record)
    }
}
