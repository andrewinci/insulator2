use log::{debug, trace};
use rdkafka::message::ToBytes;

use crate::lib::{
    parser::{Parser, ParserMode, RecordParser},
    types::{ParsedKafkaRecord, RawKafkaRecord},
    Result,
};
use std::{
    fs::OpenOptions,
    io::{LineWriter, Write},
    sync::Arc,
};

use super::{
    sqlite_store::{Query, RecordStore, SqliteStore},
    types::ExportOptions,
};

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

impl<S, P> TopicStore<S, P>
where
    S: RecordStore,
    P: Parser,
{
    pub fn from_record_store(store: Arc<S>, parser: Arc<P>, cluster_id: &str, topic_name: &str) -> Self {
        store
            .create_or_replace_topic_table(cluster_id, topic_name, false)
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

    pub fn setup(&self, compactify: bool) -> Result<()> {
        self
            .store
            .create_or_replace_topic_table(&self.cluster_id, &self.topic_name, compactify)
    }

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

    pub fn get_size(&self, query: Option<&str>) -> Result<usize> {
        match query {
            Some(query) => self.store.get_size_with_query(&Query {
                cluster_id: self.cluster_id.clone(),
                topic_name: self.topic_name.clone(),
                offset: -1,
                limit: -1,
                query_template: query.into(),
            }),
            None => self.store.get_size(&self.cluster_id, &self.topic_name),
        }
    }

    pub fn export_records(&self, options: &ExportOptions) -> Result<()> {
        let ExportOptions {
            limit,
            query,
            output_path,
            overwrite,
            parse_timestamp,
        } = options;
        debug!("Exporting records to {}", output_path);
        let query_limit = limit.unwrap_or(-1); // export all the results if no limit is specified
        let out_file = {
            if *overwrite {
                OpenOptions::new()
                    .write(true)
                    .truncate(true)
                    .create(true)
                    .open(output_path)
            } else {
                OpenOptions::new()
                    .write(true)
                    .truncate(true)
                    .create_new(true)
                    .open(output_path)
            }
        }?;
        let mut writer = LineWriter::new(out_file);
        let query_result: Vec<ParsedKafkaRecord> = self.get_records(query.as_deref(), 0, query_limit)?;
        trace!("Write records to the out file");
        writer.write_all(ParsedKafkaRecord::to_string_header().to_bytes())?;
        for record in query_result {
            writer.write_all(b"\n")?;
            writer.write_all(record.to_csv_line(*parse_timestamp).to_bytes())?;
        }
        writer.flush()?;
        debug!("Export completed");
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use std::env::temp_dir;
    use std::fs;
    use std::sync::Arc;

    use mockall::*;

    use super::TopicStore;
    use crate::lib::parser::{Parser as LibParser, ParserMode};
    use crate::lib::record_store::sqlite_store::{Query, RecordStore};
    use crate::lib::record_store::types::ExportOptions;
    use crate::lib::types::{ParsedKafkaRecord, RawKafkaRecord};
    use crate::lib::Result;
    use async_trait::async_trait;

    mock! {
        Parser {}
        #[async_trait]
        impl LibParser for Parser {
            async fn parse_record(&self, record: &RawKafkaRecord, mode: ParserMode) -> Result<ParsedKafkaRecord>;
        }
    }
    mock! {
        Store {}
        impl RecordStore for Store {
            fn query_records(&self, query: &Query) -> Result<Vec<ParsedKafkaRecord>>;
            fn get_records(&self, cluster_id: &str, topic_name: &str, offset: i64, limit: i64) -> Result<Vec<ParsedKafkaRecord>>;
            fn create_or_replace_topic_table(&self, cluster_id: &str, topic_name: &str, compacted: bool) -> Result<()>;
            fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> Result<()>;
            fn get_size(&self, cluster_id: &str, topic_name: &str) -> Result<usize>;
            fn get_size_with_query(&self, query: &Query) -> Result<usize>;
            fn destroy(&self, cluster_id: &str, topic_name: &str) -> Result<()>;
        }
    }

    #[test]
    fn test_export_all_records() {
        // arrange
        let mut mock_record_store = MockStore::new();
        let parser_mock = MockParser::new();
        mock_record_store
            .expect_create_or_replace_topic_table()
            .returning(|_, _, _| Ok(()));
        mock_record_store
            .expect_query_records()
            .returning(|_| Ok(vec![create_test_record(0), create_test_record(1)]));
        let sut = TopicStore::from_record_store(
            Arc::new(mock_record_store),
            Arc::new(parser_mock),
            "cluster_id",
            "topic_name",
        );

        let test_file = format!("{}/{}", temp_dir().to_str().unwrap(), rand::random::<usize>());
        println!("{}", test_file);
        let select_all_query = "SELECT partition, offset, timestamp, key, payload FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
        // act
        let options = ExportOptions {
            query: Some(select_all_query.to_string()),
            output_path: test_file.clone(),
            overwrite: true,
            ..Default::default()
        };
        let res = sut.export_records(&options);
        // assert
        let exported_data = fs::read_to_string(test_file).unwrap();
        assert!(res.is_ok());
        assert_eq!(
            exported_data,
            "timestamp;partition;offset;key;payload\n123123;0;0;key;payload\n123123;1;0;key;payload"
        );
    }

    #[test]
    fn test_export_no_records() {
        // arrange
        let mut mock_record_store = MockStore::new();
        let parser_mock = MockParser::new();
        mock_record_store.expect_query_records().returning(|_| Ok(vec![]));
        mock_record_store
            .expect_create_or_replace_topic_table()
            .returning(|_, _, _| Ok(()));
        let sut = TopicStore::from_record_store(
            Arc::new(mock_record_store),
            Arc::new(parser_mock),
            "cluster_id",
            "topic_name",
        );

        let test_file = format!("{}/{}", temp_dir().to_str().unwrap(), rand::random::<usize>());
        let select_all_query = "SELECT partition, offset, timestamp, key, payload FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
        // act
        let options = ExportOptions {
            query: Some(select_all_query.to_string()),
            output_path: test_file.clone(),
            overwrite: true,
            ..Default::default()
        };
        let res = sut.export_records(&options);
        // assert
        let exported_data = fs::read_to_string(test_file).unwrap();
        assert!(res.is_ok());
        assert_eq!(exported_data, "timestamp;partition;offset;key;payload");
    }

    #[test]
    fn test_overwrite_files() {
        let mut mock_record_store = MockStore::new();
        let parser_mock = MockParser::new();
        mock_record_store
            .expect_create_or_replace_topic_table()
            .returning(|_, _, _| Ok(()));
        mock_record_store.expect_query_records().returning(|_| Ok(vec![]));
        let sut = TopicStore::from_record_store(
            Arc::new(mock_record_store),
            Arc::new(parser_mock),
            "cluster_id",
            "topic_name",
        );
        let select_all_query = "SELECT partition, offset, timestamp, key, payload FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
        let options = ExportOptions {
            query: Some(select_all_query.to_string()),
            output_path: format!("{}/test{}", temp_dir().to_str().unwrap(), rand::random::<usize>()),
            overwrite: true,
            ..Default::default()
        };
        // truncate the file if overwrite true
        {
            let mut options = options.clone();
            options.overwrite = true;
            assert!(sut.export_records(&options).is_ok());
            assert!(sut.export_records(&options).is_ok());
        }
        // return err if the file already exists and overwrite is false
        {
            let mut options = options;
            options.overwrite = true;
            assert!(sut.export_records(&options).is_ok());
            options.overwrite = false;
            assert!(sut.export_records(&options).is_err());
        }
    }

    fn create_test_record(i: i32) -> ParsedKafkaRecord {
        ParsedKafkaRecord {
            payload: Some("payload".into()),
            key: Some("key".into()),
            topic: "topic".into(),
            timestamp: Some(123123),
            partition: i,
            offset: 0,
        }
    }
}
