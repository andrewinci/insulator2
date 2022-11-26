use rdkafka::message::ToBytes;

use crate::lib::{
    parser::{Parser, ParserMode, RecordParser},
    types::{ParsedKafkaRecord, RawKafkaRecord},
    Error, Result,
};
use std::{
    fs::{File},
    io::Write,
    path::Path,
    sync::Arc,
};

use super::sqlite_store::{Query, RecordStore, SqliteStore};

pub struct TopicStore<S = SqliteStore, P = RecordParser>
where
    S: RecordStore,
    P: Parser,
{
    cluster_id: String,
    topic_name: String,
    store: Arc<S>,
    parser: Arc<P>,
}

impl TopicStore<SqliteStore, RecordParser> {
    pub fn from_record_store(
        store: Arc<SqliteStore>,
        parser: Arc<RecordParser>,
        cluster_id: &str,
        topic_name: &str,
    ) -> Self {
        store
            .create_topic_table(cluster_id, topic_name)
            .unwrap_or_else(|_| {
                panic!(
                    "Unable to create the table to store the records from topic {}",
                    topic_name
                )
            });
        TopicStore {
            cluster_id: cluster_id.to_string(),
            topic_name: topic_name.to_string(),
            store,
            parser,
        }
    }
}

impl<S, P> TopicStore<S, P>
where
    S: RecordStore,
    P: Parser,
{
    pub fn get_records(&self, query: Option<&str>, offset: i64, limit: i64) -> Result<Vec<ParsedKafkaRecord>> {
        if let Some(query) = query {
            self.store.query_records(&Query {
                cluster_id: self.cluster_id.clone(),
                topic_name: self.topic_name.clone(),
                offset,
                limit,
                query_template: query.into(),
            })
        } else {
            self.store
                .get_records(&self.cluster_id, &self.topic_name, offset, limit)
        }
    }

    pub async fn insert_record(&self, record: &RawKafkaRecord) -> Result<()> {
        let parsed_record = if let Ok(avro_record) = self.parser.parse_record(record, ParserMode::Avro).await {
            Ok(avro_record)
        } else {
            self.parser.parse_record(record, ParserMode::String).await
        }?;
        self.store
            .insert_record(&self.cluster_id, &self.topic_name, &parsed_record)
    }

    pub fn clear(&self) -> Result<()> {
        self.store.clear(&self.cluster_id, &self.topic_name)
    }

    pub fn get_size(&self, query: Option<&str>) -> Result<usize> {
        if let Some(query) = query {
            self.store.get_size_with_query(&Query {
                cluster_id: self.cluster_id.clone(),
                topic_name: self.topic_name.clone(),
                offset: -1,
                limit: -1,
                query_template: query.into(),
            })
        } else {
            self.store.get_size(&self.cluster_id, &self.topic_name)
        }
    }
}
