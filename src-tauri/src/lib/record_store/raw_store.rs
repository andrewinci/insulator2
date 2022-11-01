use crate::lib::{types::ParsedKafkaRecord, Error, Result};
use futures::lock::Mutex;
use rusqlite::{named_params, Connection};
use std::sync::Arc;

pub struct RawStore {
    conn: Arc<Mutex<Connection>>,
}

impl RawStore {
    pub fn new() -> Self {
        RawStore {
            conn: Arc::new(Mutex::new(
                Connection::open_in_memory().expect("Unable to initialize the in memory sqlite DB"),
            )),
        }
    }

    pub async fn create_topic_table(&self, cluster_id: &str, topic_name: &str) -> Result<()> {
        self.conn
            .lock()
            .await
            .execute(
                format!(
                    "CREATE TABLE {} (
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
            .unwrap_or_else(|_| panic!("Unable to create the table for {} {}", cluster_id, topic_name));
        Ok(())
    }

    pub async fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> Result<()> {
        self.conn.lock().await.execute(
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
        let connection = self.conn.lock().await;
        let mut stmt = connection.prepare(
            format!(
                "SELECT partition, offset, timestamp, key, payload FROM {} ORDER BY timestamp desc LIMIT {} OFFSET {}",
                Self::get_table_name(cluster_id, topic_name),
                limit,
                offset
            )
            .as_str(),
        )?;

        let records_iter = stmt.query_map([], |row| {
            Ok(ParsedKafkaRecord {
                topic: topic_name.to_string(),
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
        let connection = self.conn.lock().await;
        let mut stmt = connection
            .prepare(format!("SELECT count(*) FROM {}", Self::get_table_name(cluster_id, topic_name)).as_str())?;
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
        self.conn
            .lock()
            .await
            .execute(
                format!("DELETE FROM {}", Self::get_table_name(cluster_id, topic_name)).as_str(),
                [],
            )
            .unwrap_or_else(|_| panic!("Unable to create the table for {} {}", cluster_id, topic_name));
        Ok(())
    }

    fn get_table_name(cluster_id: &str, topic_name: &str) -> String {
        format!("\'[{}].[{}]\'", cluster_id, topic_name)
    }
}

#[cfg(test)]
mod tests {
    use crate::lib::types::ParsedKafkaRecord;

    use super::RawStore;

    #[tokio::test]
    async fn test_create_table() {
        let db = RawStore::new();
        let res = db.create_topic_table("cluster_id_example", "topic_name_example").await;
        assert!(res.is_ok())
    }

    #[tokio::test]
    async fn test_insert_and_get_record() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = RawStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name);
        // act
        let res = db.insert_record(cluster_id, topic_name, &test_record).await;
        let records_back = db.get_records(cluster_id, topic_name, 0, 1000).await.unwrap();
        // assert
        assert!(res.is_ok());
        assert!(records_back.len() == 1);
        assert_eq!(records_back[0], test_record);
    }

    #[tokio::test]
    async fn test_get_size() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = RawStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name);
        // act
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        db.insert_record(cluster_id, topic_name, &test_record).await.unwrap();
        let table_size = db.get_size(cluster_id, topic_name).await.unwrap();
        // assert
        assert_eq!(table_size, 3);
    }

    #[tokio::test]
    async fn test_use_offset() {
        // arrange
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = RawStore::new();
        db.create_topic_table(&cluster_id, &topic_name)
            .await
            .expect("Unable to create the table");
        let test_record = get_test_record(topic_name);
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

    fn get_test_record(topic_name: &str) -> ParsedKafkaRecord {
        ParsedKafkaRecord {
            payload: Some("example payload".to_string()),
            key: Some("key".into()),
            topic: topic_name.into(),
            timestamp: Some(321123321),
            partition: 2,
            offset: 123,
        }
    }
}
