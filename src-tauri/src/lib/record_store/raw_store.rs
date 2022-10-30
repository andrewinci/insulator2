use super::{types::ParsedKafkaRecord, Result};
use rusqlite::{named_params, Connection, Error as SqlError, ToSql};
use std::{fmt::format, sync::Arc};

struct RawStore {
    conn: Arc<Connection>,
}

impl RawStore {
    pub fn new() -> Self {
        RawStore {
            conn: Arc::new(Connection::open_in_memory().expect("Unable to initialize the in memory sqlite DB")),
        }
    }

    pub fn create_topic_table(&self, cluster_id: &str, topic_name: &str) -> Result<()> {
        let query = format!(
            "CREATE TABLE test (
                partition   NUMBER,
                offset      NUMBER,
                timestamp   NUMBER,
                key         TEXT,
                payload     TEXT)"
        );

        self.conn
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
            .expect(format!("Unable to create the table for {} {}", cluster_id, topic_name).as_str());
        Ok(())
    }

    pub fn insert_record(&self, cluster_id: &str, topic_name: &str, record: &ParsedKafkaRecord) -> Result<()> {
        self.conn.execute(
            format!(
                "INSERT INTO {} (partition, offset, timestamp, key, payload) 
                VALUES (:partition, :offset, :timestamp, :key, :payload)",
                Self::get_table_name(cluster_id, topic_name)
            )
            .as_str(),
            named_params! {
                //":topicName": &RecordStore::get_table_name(cluster_id, topic_name),
                ":partition": &record.partition,
                ":offset": &record.offset,
                ":timestamp": &record.timestamp,
                ":key": &record.key,
                ":payload": &record.payload,
            },
        )?;
        Ok(())
    }

    pub fn get_records(&self, cluster_id: &str, topic_name: &str, max: i64) -> Result<Vec<ParsedKafkaRecord>> {
        let mut stmt = self.conn.prepare(
            format!(
                "SELECT partition, offset, timestamp, key, payload FROM {} ORDER BY timestamp desc LIMIT {}",
                Self::get_table_name(cluster_id, topic_name),
                max
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

    fn get_table_name(cluster_id: &str, topic_name: &str) -> String {
        format!("\'[{}].[{}]\'", cluster_id, topic_name)
    }
}

#[cfg(test)]
mod tests {
    use crate::lib::record_store::RawStore;

    #[test]
    fn test_create_table() {
        let db = RawStore::new();
        let res = db.create_topic_table("cluster_id_example", "topic_name_example");
        assert!(res.is_ok())
    }

    #[test]
    fn test_insert_record() {
        let (cluster_id, topic_name) = ("cluster_id_example", "topic_name_example");
        let db = RawStore::new();
        let test_record = crate::lib::types::ParsedKafkaRecord {
            payload: Some("example payload".to_string()),
            key: Some("key".into()),
            topic: topic_name.into(),
            timestamp: Some(321123321),
            partition: 2,
            offset: 123,
        };
        db.create_topic_table(&cluster_id, &topic_name)
            .expect("Unable to create the table");

        let res = db.insert_record(cluster_id, topic_name, &test_record);
        println!("{:?}", res);
        let records_back = db.get_records(cluster_id, topic_name, 1000).unwrap();
        assert!(res.is_ok());
        assert!(records_back.len() == 1);
        assert_eq!(records_back[0], test_record);
    }
}
