use log::{debug, trace};
use rdkafka::message::ToBytes;

use crate::core::{parser::Parser, types::RawKafkaRecord};
use std::{
    cmp::Ordering,
    fs::OpenOptions,
    io::{LineWriter, Write},
    sync::{Arc, RwLock},
    time::Duration,
};

use super::{
    error::StoreResult,
    query::{Query, QueryRow},
    record_parser::KafkaRecordParser,
    sqlite_store::{RecordStore, SqliteStore},
    types::ExportOptions,
};

pub struct TopicStore<S: RecordStore = SqliteStore, P: KafkaRecordParser = Parser> {
    cluster_id: String,
    topic_name: String,
    store: Arc<S>,
    parser: Arc<P>,
    records_counter: RwLock<usize>,
}

impl<S: RecordStore, P: KafkaRecordParser> TopicStore<S, P> {
    pub fn from_record_store(store: Arc<S>, parser: Arc<P>, cluster_id: &str, topic_name: &str) -> Self {
        store
            .create_or_replace_topic_table(cluster_id, topic_name, false)
            .unwrap_or_else(|_| panic!("Unable to create the table to store the records from topic {topic_name}"));
        TopicStore {
            cluster_id: cluster_id.to_string(),
            topic_name: topic_name.to_string(),
            store,
            parser,
            records_counter: Default::default(),
        }
    }

    pub fn setup(&self, compactify: bool) -> StoreResult<()> {
        *self.records_counter.write().unwrap() = 0;
        self.store
            .create_or_replace_topic_table(&self.cluster_id, &self.topic_name, compactify)
    }

    pub fn get_records(
        &self,
        query: Option<&str>,
        offset: i64,
        limit: i64,
        timeout: Option<Duration>,
    ) -> StoreResult<Vec<QueryRow>> {
        self.store.query_records(
            &Query {
                cluster_id: self.cluster_id.clone(),
                topic_name: self.topic_name.clone(),
                offset,
                limit,
                query_template: match query {
                    Some(query) => query,
                    None => Query::SELECT_ALL_WITH_OFFSET_LIMIT_QUERY,
                }
                .into(),
            },
            timeout,
        )
    }

    pub async fn insert_record(&self, record: &RawKafkaRecord) -> StoreResult<()> {
        *self.records_counter.write().unwrap() += 1;
        let parsed_record = self.parser.parse_kafka_record(record).await?;
        self.store
            .insert_record(&self.cluster_id, &self.topic_name, &parsed_record)
    }

    pub fn get_records_count(&self) -> StoreResult<usize> {
        Ok(*self.records_counter.read().unwrap())
    }

    pub fn export_records(&self, options: &ExportOptions) -> StoreResult<()> {
        let ExportOptions {
            limit,
            query,
            output_path,
            overwrite,
            parse_timestamp,
        } = options;
        debug!("Exporting records to {}", output_path);
        const SEPARATOR: &str = ";";
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
        let query_result = self.get_records(query.as_deref(), 0, query_limit, Some(Duration::from_secs(3 * 60)))?;
        trace!("Write records to the out file");
        // assumption: all rows in the query_result have the same keys
        let columns = query_result
            .get(0)
            .map(|r| r.keys().map(|s| s.as_str()).collect::<Vec<_>>());
        if let Some(columns) = columns {
            let columns = sort_columns(&columns[..]);
            let header = columns.join(SEPARATOR);

            // write the csv header
            writer.write_all(header.to_bytes())?;
            for record in query_result.iter() {
                writer.write_all(b"\n")?;
                let row: Vec<_> = columns
                    .iter()
                    .map(|c| {
                        record
                            .get(c)
                            .map(|v| match c.as_str() {
                                Query::TIMESTAMP => v.extract_timestamp(*parse_timestamp),
                                _ => v.to_string(),
                            })
                            .unwrap_or_default()
                    })
                    .collect();
                // todo: support parse timestamp
                writer.write_all(row.join(SEPARATOR).to_bytes())?;
            }
        } else {
            writer.write_all("The query didn't return any result".to_bytes())?;
            debug!("The query didn't return any result");
        }
        writer.flush()?;
        debug!("Export completed");
        Ok(())
    }
}

pub(super) fn sort_columns(columns: &[&str]) -> Vec<String> {
    // custom sort:
    // - if the timestamp is available, it has to be the first
    // - if the payload is available, it has to be the last
    // - if the key is available, it has to be right before the payload
    let mut res: Vec<_> = Vec::from(columns).iter().map(|&s| s.to_owned()).collect();
    res.sort_by(|a, b| {
        if a == Query::KEY && b == Query::PAYLOAD {
            Ordering::Less
        } else if a == Query::PAYLOAD && b == Query::KEY {
            Ordering::Greater
        } else if a == Query::TIMESTAMP || b == Query::PAYLOAD || b == Query::KEY {
            Ordering::Less
        } else if b == Query::TIMESTAMP || a == Query::PAYLOAD || a == Query::KEY {
            Ordering::Greater
        } else {
            a.cmp(b)
        }
    });
    res
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;
    use std::env::temp_dir;
    use std::fs;
    use std::sync::Arc;
    use std::time::Duration;

    use mockall::*;

    use super::TopicStore;
    use crate::core::record_store::error::StoreResult;
    use crate::core::record_store::query::{Query, QueryRow};
    use crate::core::record_store::record_parser::KafkaRecordParser;
    use crate::core::record_store::sqlite_store::RecordStore;
    use crate::core::record_store::topic_store::sort_columns;
    use crate::core::record_store::types::ExportOptions;
    use crate::core::record_store::QueryRowValue;
    use crate::core::types::{ParsedKafkaRecord, RawKafkaRecord};
    use async_trait::async_trait;

    mock! {
        Parser {}
        #[async_trait]
        impl KafkaRecordParser for Parser {
            async fn parse_kafka_record(&self, record: &RawKafkaRecord) -> StoreResult<ParsedKafkaRecord>;
        }
    }
    mock! {
        Store {}
        impl RecordStore for Store {
            fn query_records(&self, query: &Query, timeout: Option<Duration>) -> StoreResult<Vec<QueryRow>>;
            fn create_or_replace_topic_table(&self, cluster_id: &str, topic_name: &str, compacted: bool) -> StoreResult<()>;
            fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> StoreResult<()>;
            fn destroy(&self, cluster_id: &str, topic_name: &str) -> StoreResult<()>;
        }
    }

    #[test]
    fn test_sort_columns() {
        // sort alphabetical if there are no keys
        {
            let columns = vec!["1", "3", "0", "2"];
            let res = sort_columns(&columns[..]);
            assert_eq!(res, vec!["0", "1", "2", "3"]);
        }
        // - if the timestamp is available, it has to be the first
        {
            let columns = vec!["1", "3", Query::TIMESTAMP, "2"];
            let res = sort_columns(&columns[..]);
            assert_eq!(res, vec![Query::TIMESTAMP, "1", "2", "3"]);
        }
        // - if the payload is available, it has to be the last
        {
            let columns = vec!["1", "3", Query::PAYLOAD, "2"];
            let res = sort_columns(&columns[..]);
            assert_eq!(res, vec!["1", "2", "3", Query::PAYLOAD]);
        }
        // - if the key is available, it has to be right before the payload
        {
            let columns = vec!["1", "3", Query::KEY, "2"];
            let res = sort_columns(&columns[..]);
            assert_eq!(res, vec!["1", "2", "3", Query::KEY]);
        }
        // - if the key is available, it has to be right before the payload
        {
            let columns = vec![Query::PAYLOAD, "1", "3", Query::KEY, "2"];
            let res = sort_columns(&columns[..]);
            assert_eq!(res, vec!["1", "2", "3", Query::KEY, Query::PAYLOAD]);
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
            .returning(|_, _| Ok(vec![create_test_record(0), create_test_record(1)]));
        let sut = TopicStore::from_record_store(
            Arc::new(mock_record_store),
            Arc::new(parser_mock),
            "cluster_id",
            "topic_name",
        );

        let test_file = format!("{}/{}", temp_dir().to_str().unwrap(), rand::random::<usize>());
        println!("{}", test_file);
        let select_all_query = "SELECT * FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
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
            "timestamp;offset;partition;key;payload\n123123;0;0;key;payload\n123123;0;1;key;payload"
        );
    }

    #[test]
    fn test_export_no_records() {
        // arrange
        let mut mock_record_store = MockStore::new();
        let parser_mock = MockParser::new();
        mock_record_store.expect_query_records().returning(|_, _| Ok(vec![]));
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
        let select_all_query = "SELECT * FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
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
        assert_eq!(exported_data, "The query didn't return any result");
    }

    #[test]
    fn test_overwrite_files() {
        let mut mock_record_store = MockStore::new();
        let parser_mock = MockParser::new();
        mock_record_store
            .expect_create_or_replace_topic_table()
            .returning(|_, _, _| Ok(()));
        mock_record_store.expect_query_records().returning(|_, _| Ok(vec![]));
        let sut = TopicStore::from_record_store(
            Arc::new(mock_record_store),
            Arc::new(parser_mock),
            "cluster_id",
            "topic_name",
        );
        let select_all_query = "SELECT * FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
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

    fn create_test_record(i: i32) -> QueryRow {
        HashMap::from([
            (Query::PAYLOAD.into(), QueryRowValue::Text("payload".into())),
            (Query::KEY.into(), QueryRowValue::Text("key".into())),
            (Query::TIMESTAMP.into(), QueryRowValue::Integer(123123)),
            (Query::PARTITION.into(), QueryRowValue::Integer(i.into())),
            (Query::OFFSET.into(), QueryRowValue::Integer(0)),
        ])
    }
}
