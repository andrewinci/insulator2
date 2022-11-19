use crate::lib::{types::ParsedKafkaRecord, Error, Result};
use parking_lot::FairMutex;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{named_params, Connection, OpenFlags};
use std::sync::Arc;

pub struct Query {
    pub cluster_id: String,
    pub topic_name: String,
    pub offset: i64,
    pub limit: i64,
    pub query_template: String,
}
pub struct AppStore {
    _file_name: String,
    write_connection: Arc<FairMutex<Connection>>,
    read_connection_pool: Pool<SqliteConnectionManager>,
}

impl AppStore {
    pub fn new() -> Self {
        //todo: try in memory with shared cache "file::memory:?cache=shared&mode=memory";
        let file_name = "file::memory:?cache=shared&mode=memory"; //"/tmp/temp.db";//todo: use a temporary file to delete on drop 
        let flags_w = OpenFlags::SQLITE_OPEN_READ_WRITE
            | OpenFlags::SQLITE_OPEN_CREATE
            | OpenFlags::SQLITE_OPEN_NO_MUTEX
            | OpenFlags::SQLITE_OPEN_URI;
        let conn_w =
            Connection::open_with_flags(&file_name, flags_w).expect("Unable to initialize the in memory sqlite DB");
        conn_w.pragma_update(None, "journal_mode", &"OFF").unwrap();
        conn_w.pragma_update(None, "synchronous", &"OFF").unwrap();
        conn_w.pragma_update(None, "page_size", &"4096").unwrap();
        conn_w.pragma_update(None, "cache_size", &"16384").unwrap();
        conn_w.pragma_update(None, "locking_mode", &"NORMAL").unwrap();
        conn_w.pragma_update(None, "read_uncommitted", &"ON").unwrap();
        
        let flags_r = OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX | OpenFlags::SQLITE_OPEN_URI;
        let manager = SqliteConnectionManager::file(file_name).with_flags(flags_r).with_init(|conn| {
            conn.pragma_update(None, "journal_mode", &"OFF").unwrap();
            conn.pragma_update(None, "synchronous", &"OFF").unwrap();
            conn.pragma_update(None, "page_size", &"4096").unwrap();
            conn.pragma_update(None, "cache_size", &"16384").unwrap();
            conn.pragma_update(None, "locking_mode", &"NORMAL").unwrap();
            conn.pragma_update(None, "read_uncommitted", &"ON").unwrap();
            conn.pragma_update(None, "query_only", &"ON").unwrap();
            Ok(())
        });

        AppStore {
            _file_name: file_name.to_owned(),
            write_connection: Arc::new(FairMutex::new(conn_w)),
            read_connection_pool: r2d2::Pool::builder().max_size(20).build(manager).expect("Unable to initialize the read only connection pool to the db"),
        }
    }

    pub async fn create_topic_table(&self, cluster_id: &str, topic_name: &str) -> Result<()> {
        self.write_connection
            .lock()
            .execute(
                format!(
                    "CREATE TABLE IF NOT EXISTS {} (
                        partition   NUMBER,
                        offset      NUMBER,
                        timestamp   NUMBER,
                        key         TEXT,
                        payload     TEXT)",
                    Self::get_table_name(cluster_id, topic_name)
                )
                .as_str(),
                [],
            )
            .unwrap_or_else(|e| panic!("Unable to create the table for {} {} {:?}", cluster_id, topic_name, e));
        Ok(())
    }

    pub async fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> Result<()> {
        self.write_connection.lock().execute(
            format!(
                "INSERT INTO {} (partition, offset, timestamp, key, payload) 
                VALUES (:partition, :offset, :timestamp, :key, :payload)",
                Self::get_table_name(cluster_id, topic_name)
            )
            .as_str(),
            named_params! {
                ":partition": &record.partition,
                ":offset": &record.offset,
                ":timestamp": &record.timestamp,
                ":key": &record.key,
                ":payload": &record.payload,
            },
        )?;
        Ok(())
    }

    pub async fn get_records(
        &self,
        cluster_id: &str,
        topic_name: &str,
        offset: i64,
        limit: i64,
    ) -> Result<Vec<ParsedKafkaRecord>> {
        self.query_records(&Query {
            cluster_id: cluster_id.into(),
            topic_name: topic_name.into(),
            offset,
            limit,
            query_template: "SELECT partition, offset, timestamp, key, payload FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}".into(),
        })
        .await
    }

    pub async fn query_records(&self, query: &Query) -> Result<Vec<ParsedKafkaRecord>> {
        let connection = self.read_connection_pool.get().unwrap();
        let parsed_query = Self::parse_query(query);
        let mut stmt = connection.prepare(&parsed_query)?;

        let records_iter = stmt.query_map([], |row| {
            Ok(ParsedKafkaRecord {
                topic: query.topic_name.clone(),
                partition: row.get(0)?,
                offset: row.get(1)?,
                timestamp: row.get(2)?,
                key: row.get(3)?,
                payload: row.get(4)?,
            })
        })?;
        let mut records = Vec::new();
        for r in records_iter {
            records.push(r?);
        }
        Ok(records)
    }

    pub async fn get_size(&self, cluster_id: &str, topic_name: &str) -> Result<usize> {
        self.get_size_with_query(&Query {
            cluster_id: cluster_id.into(),
            topic_name: topic_name.into(),
            offset: 0,
            limit: 0,
            query_template: "SELECT offset FROM {:topic}".into(),
        })
        .await
    }

    pub async fn get_size_with_query(&self, query: &Query) -> Result<usize> {
        // let connection = self.write_connection.lock();
        let connection = self.read_connection_pool.get().unwrap();
        let mut stmt = connection.prepare(format!("SELECT count(*) FROM ({})", Self::parse_query(query)).as_str())?;
        let rows: Vec<_> = stmt.query_map([], |row| row.get::<_, i64>(0))?.collect();
        if let Some(Ok(size)) = rows.first() {
            Ok(*size as usize)
        } else {
            Err(Error::SqlError {
                message: "Unable to get the table size".into(),
            })
        }
    }

    pub async fn clear(&self, cluster_id: &str, topic_name: &str) -> Result<()> {
        self.write_connection
            .lock()
            .execute(
                format!("DELETE FROM {}", Self::get_table_name(cluster_id, topic_name)).as_str(),
                [],
            )
            .unwrap_or_else(|_| panic!("Unable to create the table for {} {}", cluster_id, topic_name));
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
        format!("\'[{}].[{}]\'", cluster_id, topic_name)
    }
}

#[cfg(test)]
mod tests {
    use std::{sync::Arc, thread::spawn, time::Instant};

    use crate::lib::{record_store::app_store::Query, types::ParsedKafkaRecord};

    use super::AppStore;

    #[tokio::test]
    async fn test_create_table() {
        let db = AppStore::new();
        let res = db.create_topic_table("cluster_id_example", "topic_name_example").await;
        assert!(res.is_ok())
    }

    #[tokio::test]
    async fn test_insert_and_get_record() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = AppStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name, 0);
        // act
        let res = db.insert_record(cluster_id, topic_name, &test_record).await;
        let records_back = db.get_records(cluster_id, topic_name, 0, 1000).await.unwrap();
        // assert
        assert!(res.is_ok());
        assert_eq!(records_back.len(), 1);
        assert_eq!(records_back[0], test_record);
    }

    #[tokio::test]
    async fn test_get_size() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = AppStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name, 0);
        // act
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        let table_size = db.get_size(cluster_id, topic_name).await.unwrap();
        // assert
        assert_eq!(table_size, 3);
    }

    #[tokio::test]
    async fn test_get_size_with_query() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = AppStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        // act
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 1))
            .await
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 0))
            .await
            .unwrap();
        db.insert_record(cluster_id, topic_name, &get_test_record(topic_name, 0))
            .await
            .unwrap();
        let table_size = db
            .get_size_with_query(&Query {
                cluster_id: cluster_id.into(),
                topic_name: topic_name.into(),
                limit: -1,
                offset: -1,
                query_template:
                    "SELECT * from {:topic} WHERE offset = 0 ORDER BY offset LIMIT {:limit} OFFSET {:offset};".into(),
            })
            .await
            .unwrap();
        // assert
        assert_eq!(table_size, 2);
    }

    #[tokio::test]
    async fn test_use_offset() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = AppStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name, 0);
        // act
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        let first_1000_res = db.get_records(cluster_id, topic_name, 0, 1000).await.unwrap();
        let first_res = db.get_records(cluster_id, topic_name, 1, 1).await.unwrap();
        let no_res = db.get_records(cluster_id, topic_name, 3, 1000).await.unwrap();
        // assert
        assert_eq!(first_1000_res.len(), 3);
        assert_eq!(first_res.len(), 1);
        assert_eq!(no_res.len(), 0);
    }

    #[tokio::test] //73 seconds sqlite, 70 seconds tokio-rusqlite
    async fn bench_insert_and_get_record() {
        use futures::executor::block_on;
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = Arc::new(AppStore::new());
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");

        async fn write(id: i32, db: Arc<AppStore>, cluster_id: &str, topic_name: &str) {
            let start = Instant::now();
            let test_record = get_test_record(topic_name, 0);
            for i in 0..10_000 {
                let res = db.insert_record(cluster_id, topic_name, &test_record).await;
                if res.is_err() {
                    println!("write-{} {} {:?}", id, i, res);
                }
            }
            println!("write-{} Time elapsed: {:?}", id, start.elapsed());
        }

        async fn read(id: i32, db: Arc<AppStore>, cluster_id: &str, topic_name: &str) {
            let start = Instant::now();
            for i in 0..10_000 {
                let res = db.get_records(cluster_id, topic_name, 0, 1000).await;
                if res.is_err() {
                    println!("read-{} {} {:?}", id, i, res);
                }
            }
            println!("read-{} Time elapsed: {:?}", id, start.elapsed());
        }

        // act
        let write1 = spawn({
            let db = db.clone();
            move || block_on(write(1, db.clone(), cluster_id, topic_name))
        });

        let read1 = spawn({
            let db = db.clone();
            move || block_on(read(1, db.clone(), cluster_id, topic_name))
        });

        let write2 = spawn({
            let db = db.clone();
            move || block_on(write(2, db.clone(), cluster_id, topic_name))
        });

        let write3 = spawn({
            let db = db.clone();
            move || block_on(write(3, db.clone(), cluster_id, topic_name))
        });

        let read2 = spawn({
            let db = db.clone();
            move || block_on(read(2, db.clone(), cluster_id, topic_name))
        });

        assert!(write1.join().is_ok());
        assert!(read1.join().is_ok());
        assert!(read2.join().is_ok());
        assert!(write2.join().is_ok());
        assert!(write3.join().is_ok());
    }

    fn get_test_record(topic_name: &str, offset: i64) -> ParsedKafkaRecord {
        ParsedKafkaRecord {
            payload: Some("example payload".to_string()),
            key: Some("key".into()),
            topic: topic_name.into(),
            timestamp: Some(321123321),
            partition: 2,
            offset,
        }
    }
}
