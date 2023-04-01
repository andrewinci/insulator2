use core::time;
use std::{
    collections::HashMap,
    time::{Duration, Instant},
};

use crate::core::types::ParsedKafkaRecord;
use log::debug;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{backup::Backup, named_params, Connection, OpenFlags};

use super::{
    error::StoreResult,
    query::{Query, QueryResultRow},
    QueryResultRowItem,
};

pub trait RecordStore {
    fn create_or_replace_topic_table(&self, cluster_id: &str, topic_name: &str, compacted: bool) -> StoreResult<()>;
    fn query_records(&self, query: &Query, timeout: Option<Duration>) -> StoreResult<Vec<QueryResultRow>>;
    fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> StoreResult<()>;
    fn destroy(&self, cluster_id: &str, topic_name: &str) -> StoreResult<()>;
}

pub struct SqliteStore {
    pool: Pool<SqliteConnectionManager>,
    timeout: Duration,
}

impl RecordStore for SqliteStore {
    fn query_records(&self, query: &Query, timeout: Option<Duration>) -> StoreResult<Vec<QueryResultRow>> {
        let parsed_query = Self::parse_query(query);
        // closure that actually execute the query
        let _get_records = move |connection: &r2d2::PooledConnection<SqliteConnectionManager>| {
            let mut stmt = connection.prepare(&parsed_query)?;
            let columns: Vec<_> = stmt
                .column_names()
                .iter()
                .enumerate()
                .map(|(i, &c)| (i, c.to_owned()))
                .collect();
            let records_iter = stmt.query_map([], |row| {
                let res = {
                    let mut tmp = HashMap::new();
                    for (i, c) in columns.iter() {
                        let value = row.get_ref(i.to_owned())?;
                        let value = match value {
                            rusqlite::types::ValueRef::Null => QueryResultRowItem::Null,
                            rusqlite::types::ValueRef::Integer(v) => QueryResultRowItem::Integer(v),
                            rusqlite::types::ValueRef::Real(v) => QueryResultRowItem::Real(v),
                            rusqlite::types::ValueRef::Text(_) => QueryResultRowItem::Text(value.as_str()?.into()),
                            rusqlite::types::ValueRef::Blob(v) => QueryResultRowItem::Blob(v.into()),
                        };
                        tmp.insert(c.to_owned(), value);
                    }
                    tmp
                };
                Ok(res)
            })?;
            let mut records = Vec::new();
            for r in records_iter {
                records.push(r?);
            }
            Ok(records)
        };
        let connection = self.pool.get().unwrap();
        let start_query = Instant::now();
        let timeout = timeout.unwrap_or(self.timeout);
        // setup the progress handler for the connection
        connection.progress_handler(2500, Some(move || start_query.elapsed() > timeout));
        // run the query
        let result = _get_records(&connection);
        // remove the progress handler attached to the connection before returning the result
        connection.progress_handler(0, None::<fn() -> bool>);
        result
    }

    fn create_or_replace_topic_table(&self, cluster_id: &str, topic_name: &str, compacted: bool) -> StoreResult<()> {
        let connection = self.pool.get().unwrap();
        self.destroy(cluster_id, topic_name)?;
        connection
            .execute(
                format!(
                    "CREATE TABLE {} (
                        payload      TEXT,
                        key          TEXT {},
                        timestamp    NUMBER,
                        partition    NUMBER NON NULL,
                        offset       NUMBER NON NULL,
                        schema_id    NUMBER,
                        record_bytes NUMBER,
                    PRIMARY KEY (partition, offset))",
                    Self::get_table_name(cluster_id, topic_name),
                    match compacted {
                        true => "UNIQUE",
                        false => "",
                    }
                )
                .as_str(),
                [],
            )
            .unwrap_or_else(|e| panic!("Unable to create the table for {cluster_id} {topic_name} {e:?}"));
        Ok(())
    }

    fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> StoreResult<()> {
        let connection = self.pool.get().unwrap();
        connection.execute(
            format!(
                "INSERT OR REPLACE INTO {} (payload, key, timestamp, partition, offset, schema_id, record_bytes) 
                VALUES (:payload, :key, :timestamp, :partition, :offset, :schema_id, :record_bytes)",
                Self::get_table_name(cluster_id, topic_name)
            )
            .as_str(),
            named_params! {
                ":payload": &record.payload,
                ":key": &record.key,
                ":timestamp": &record.timestamp,
                ":partition": &record.partition,
                ":offset": &record.offset,
                ":schema_id": &record.schema_id,
                ":record_bytes": &record.record_bytes,
            },
        )?;
        Ok(())
    }

    fn destroy(&self, cluster_id: &str, topic_name: &str) -> StoreResult<()> {
        let connection = self.pool.get().unwrap();
        connection
            .execute(
                format!("DROP TABLE IF EXISTS {}", Self::get_table_name(cluster_id, topic_name)).as_str(),
                [],
            )
            .unwrap_or_else(|_| panic!("Unable to create the table for {cluster_id} {topic_name}"));
        Ok(())
    }
}

impl SqliteStore {
    pub fn new(timeout: Duration) -> Self {
        let file_name = format!("file::memory{}:?cache=shared&mode=memory", rand::random::<usize>());
        let flags_r = OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_NO_MUTEX | OpenFlags::SQLITE_OPEN_URI;
        let manager = SqliteConnectionManager::file(file_name)
            .with_flags(flags_r)
            .with_init(|conn| {
                conn.pragma_update(None, "journal_mode", "OFF").unwrap();
                conn.pragma_update(None, "synchronous", "OFF").unwrap();
                conn.pragma_update(None, "page_size", "4096").unwrap();
                conn.pragma_update(None, "cache_size", "16384").unwrap();
                conn.pragma_update(None, "locking_mode", "NORMAL").unwrap();
                conn.pragma_update(None, "read_uncommitted", "ON").unwrap();
                Ok(())
            });
        let pool = r2d2::Pool::builder()
            .max_size(20)
            .build(manager)
            .expect("Unable to initialize the read only connection pool to the db");
        SqliteStore { pool, timeout }
    }

    #[cfg(test)]
    fn get_size(&self, query: &Query) -> StoreResult<usize> {
        use super::error::StoreError;

        let connection = self.pool.get().unwrap();
        let mut stmt = connection.prepare(format!("SELECT count(*) FROM ({})", Self::parse_query(query)).as_str())?;
        let rows: Vec<_> = stmt.query_map([], |row| row.get::<_, i64>(0))?.collect();
        if let Some(Ok(size)) = rows.first() {
            Ok(*size as usize)
        } else {
            Err(StoreError::SqlError("Unable to get the table size".to_string()))
        }
    }

    pub fn export_db(&self, output_path: &str) -> StoreResult<()> {
        let src = self.pool.get().unwrap();
        let mut dst = Connection::open(output_path)?;
        let backup = Backup::new(&src, &mut dst)?;
        // update the completion percentage in debug
        backup.run_to_completion(
            1000,                             // number of pages per step
            time::Duration::from_millis(100), // pause between steps
            Some(|p| {
                debug!(
                    "Export in progress: {}%",
                    100f32 * ((p.pagecount - p.remaining) as f32 / p.pagecount as f32)
                )
            }),
        )?;
        Ok(())
    }

    fn parse_query(query: &Query) -> String {
        let Query {
            cluster_id,
            topic_name,
            offset,
            limit,
            query_template,
        } = query;
        let query = query_template
            .replace("{:topic}", Self::get_table_name(cluster_id, topic_name).as_str())
            .replace("{:limit}", limit.to_string().as_str())
            .replace("{:offset}", offset.to_string().as_str());
        let query = query.trim();
        if query.ends_with(';') {
            let mut chars = query.chars();
            chars.next_back();
            chars.as_str().into()
        } else {
            query.into()
        }
    }

    fn get_table_name(cluster_id: &str, topic_name: &str) -> String {
        format!("\'[{cluster_id}].[{topic_name}]\'")
    }
}

#[cfg(test)]
mod tests {
    use crate::core::{
        record_store::{error::StoreError, sqlite_store::Query, QueryResultRow},
        types::ParsedKafkaRecord,
    };
    use std::{
        env::temp_dir,
        sync::Arc,
        thread::spawn,
        time::{Duration, Instant},
    };

    use super::{RecordStore, SqliteStore};

    fn get_test_db_path() -> String {
        let mut dir = temp_dir();
        dir.push("test.db");
        dir.to_str().unwrap().into()
    }

    #[tokio::test]
    async fn test_export_database() {
        // arrange
        let test_db_path = get_test_db_path();
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        db.create_or_replace_topic_table(cluster_id, topic_name, false).unwrap();
        let test_record = get_test_record(topic_name, 0);
        db.insert_record(cluster_id, topic_name, &test_record).unwrap();
        // act
        let res = db.export_db(&test_db_path);
        // assert
        assert!(res.is_ok());
        //todo: validate DB content
    }

    #[tokio::test]
    async fn test_create_table() {
        let db = SqliteStore::new(Duration::from_secs(10));
        let res = db.create_or_replace_topic_table("cluster_id_example", "topic_name_example", false);
        assert!(res.is_ok())
    }

    #[tokio::test]
    async fn test_insert_and_get_record() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name, 0);
        // act
        db.insert_record(cluster_id, topic_name, &test_record).unwrap();
        let records_back = db
            .query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None)
            .unwrap();
        // assert
        assert_eq!(records_back.len(), 1);
        assert_eq!(parse_row(&records_back[0], &test_record.topic), test_record);
    }

    #[tokio::test]
    async fn test_query_timeout() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_micros(1));
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        // act
        (0..10000).for_each(|i| {
            db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, i))
                .unwrap()
        });
        let records_back = db.query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None);
        // assert
        assert_eq!(
            records_back.err().unwrap(),
            StoreError::SqlError("Operation timed out".into())
        );
    }

    #[tokio::test]
    async fn test_insert_and_get_records() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        let test_record1 = get_test_record(topic_name, 0);
        let test_record2 = ParsedKafkaRecord {
            offset: 1,
            payload: Some("latest-test".into()),
            ..test_record1.clone()
        };
        // compacted table should replace old records with same key
        {
            db.create_or_replace_topic_table(cluster_id, topic_name, true)
                .expect("Unable to create the table");
            // act
            db.insert_record(cluster_id, topic_name, &test_record1).unwrap();
            db.insert_record(cluster_id, topic_name, &test_record2).unwrap();
            let records_back = db
                .query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None)
                .unwrap();
            // assert
            assert_eq!(records_back.len(), 1);
            assert_eq!(parse_row(&records_back[0], &test_record2.topic), test_record2);
        }
        // non compacted table should persist all the data
        {
            db.create_or_replace_topic_table(cluster_id, topic_name, false)
                .expect("Unable to create the table");
            // act
            db.insert_record(cluster_id, topic_name, &test_record1).unwrap();
            db.insert_record(cluster_id, topic_name, &test_record2).unwrap();
            let records_back = db
                .query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None)
                .unwrap();
            // assert
            assert_eq!(records_back.len(), 2);
            assert_eq!(parse_row(&records_back[1], &test_record2.topic), test_record2);
        }
    }

    #[tokio::test]
    async fn test_get_size() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        // act
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 0))
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 1))
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 2))
            .unwrap();
        let table_size = db
            .get_size(&Query::select_any(cluster_id, topic_name, 0, 1000))
            .unwrap();
        // assert
        assert_eq!(table_size, 3);
    }

    #[tokio::test]
    async fn test_get_size_with_query() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        let record1 = ParsedKafkaRecord {
            key: Some("test".into()),
            ..get_test_record(topic_name, 1)
        };
        let record2 = ParsedKafkaRecord {
            offset: 2,
            ..record1.clone()
        };
        // act
        db.insert_record(cluster_id, topic_name, &record1).unwrap();
        db.insert_record(cluster_id, topic_name, &record2).unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 3))
            .unwrap();
        let table_size = db
            .get_size(&Query {
                cluster_id: cluster_id.into(),
                topic_name: topic_name.into(),
                limit: -1,
                offset: -1,
                query_template:
                    "SELECT * from {:topic} WHERE key = \"test\" ORDER BY offset LIMIT {:limit} OFFSET {:offset};".into(),
            })
            .unwrap();
        // assert
        assert_eq!(table_size, 2);
    }

    #[tokio::test]
    async fn test_use_offset() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = SqliteStore::new(Duration::from_secs(10));
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        // act
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 0))
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 1))
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 2))
            .unwrap();
        let first_1000_res = db
            .query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None)
            .unwrap();
        let first_res = db
            .query_records(&Query::select_any(cluster_id, topic_name, 1, 1), None)
            .unwrap();
        let no_res = db
            .query_records(&Query::select_any(cluster_id, topic_name, 3, 1000), None)
            .unwrap();
        // assert
        assert_eq!(first_1000_res.len(), 3);
        assert_eq!(first_res.len(), 1);
        assert_eq!(no_res.len(), 0);
    }

    #[ignore]
    #[tokio::test]
    async fn bench_insert_and_get_record() {
        use futures::executor::block_on;
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let topic_name2 = "topic_name_example2";
        let db = Arc::new(SqliteStore::new(Duration::from_secs(10)));

        async fn write(id: i32, db: Arc<SqliteStore>, cluster_id: &str, topic_name: &str) {
            let start = Instant::now();
            let test_record = get_test_record(topic_name, 0);
            for i in 0..10_000 {
                let res = db.insert_record(cluster_id, topic_name, &test_record);
                if res.is_err() {
                    println!("write-{} {} {:?}", id, i, res);
                }
            }
            println!("write-{} Time elapsed: {:?}", id, start.elapsed());
        }

        async fn read(id: i32, db: Arc<SqliteStore>, cluster_id: &str, topic_name: &str) {
            let start = Instant::now();
            for i in 0..10_000 {
                let res = db.query_records(&Query::select_any(cluster_id, topic_name, 0, 1000), None);
                if res.is_err() {
                    println!("read-{} {} {:?}", id, i, res);
                }
            }
            println!("read-{} Time elapsed: {:?}", id, start.elapsed());
        }

        // act
        // topic1
        db.create_or_replace_topic_table(cluster_id, topic_name, false)
            .expect("Unable to create the table");
        let write1 = spawn({
            let db = db.clone();
            move || block_on(write(1, db.clone(), cluster_id, topic_name))
        });

        let read1 = spawn({
            let db = db.clone();
            move || block_on(read(1, db.clone(), cluster_id, topic_name))
        });

        let read2 = spawn({
            let db = db.clone();
            move || block_on(read(2, db.clone(), cluster_id, topic_name))
        });

        // topic2
        db.create_or_replace_topic_table(cluster_id, topic_name2, false)
            .expect("Unable to create the table");

        let write2 = spawn({
            let db = db.clone();
            move || block_on(write(2, db.clone(), cluster_id, topic_name2))
        });

        let read3 = spawn({
            let db = db.clone();
            move || block_on(read(2, db.clone(), cluster_id, topic_name2))
        });

        let read4 = spawn({
            let db = db;
            move || block_on(read(2, db.clone(), cluster_id, topic_name2))
        });

        assert!(write1.join().is_ok());
        assert!(read1.join().is_ok());
        assert!(read2.join().is_ok());
        assert!(write2.join().is_ok());
        assert!(read3.join().is_ok());
        assert!(read4.join().is_ok());
    }

    fn get_test_record(topic_name: &str, offset: i64) -> ParsedKafkaRecord {
        ParsedKafkaRecord {
            payload: Some("example payload".to_string()),
            key: Some("key".into()),
            topic: topic_name.into(),
            timestamp: Some(321123321),
            partition: 2,
            offset,
            schema_id: None,
            record_bytes: 123,
        }
    }

    fn parse_row(row: &QueryResultRow, topic_name: &str) -> ParsedKafkaRecord {
        ParsedKafkaRecord {
            payload: match row.get(Query::PAYLOAD) {
                None => None,
                Some(crate::core::record_store::QueryResultRowItem::Text(v)) => Some(v.to_string()),
                _ => panic!("invalid type"),
            },
            key: match row.get(Query::KEY) {
                None => None,
                Some(crate::core::record_store::QueryResultRowItem::Text(v)) => Some(v.to_string()),
                _ => panic!("invalid type"),
            },
            // the topic name is not part of the table since can be retrieved
            // by the table name
            topic: topic_name.into(),
            timestamp: match row.get(Query::TIMESTAMP) {
                None => None,
                Some(crate::core::record_store::QueryResultRowItem::Integer(v)) => Some((*v).try_into().unwrap()),
                _ => panic!("invalid type"),
            },
            partition: match row.get(Query::PARTITION) {
                Some(crate::core::record_store::QueryResultRowItem::Integer(v)) => (*v).try_into().unwrap(),
                _ => panic!("invalid type"),
            },
            offset: match row.get(Query::OFFSET) {
                Some(crate::core::record_store::QueryResultRowItem::Integer(v)) => *v,
                _ => panic!("invalid type"),
            },
            schema_id: None,
            record_bytes: 123,
        }
    }
}
