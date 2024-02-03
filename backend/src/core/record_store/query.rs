use std::collections::HashMap;

use rust_decimal::prelude::ToPrimitive;
use serde::Serialize;
use std::time::{Duration, UNIX_EPOCH};
use time::format_description::well_known;

#[derive(Debug)]
pub struct Query {
    pub cluster_id: String,
    pub topic_name: String,
    pub offset: i64,
    pub limit: i64,
    pub query_template: String,
}

impl Query {
    #[cfg(test)]
    pub const PARTITION: &'static str = "partition";
    #[cfg(test)]
    pub const OFFSET: &'static str = "offset";
    pub const TIMESTAMP: &'static str = "timestamp";
    pub const KEY: &'static str = "key";
    pub const PAYLOAD: &'static str = "payload";
    pub const SELECT_ALL_WITH_OFFSET_LIMIT_QUERY: &'static str =
        "SELECT * FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";

    #[cfg(test)]
    pub fn select_any(cluster_id: &str, topic_name: &str, offset: i64, limit: i64) -> Query {
        Query {
            cluster_id: cluster_id.into(),
            topic_name: topic_name.into(),
            limit,
            offset,
            query_template: Query::SELECT_ALL_WITH_OFFSET_LIMIT_QUERY.into(),
        }
    }
}

pub type QueryResultRow = HashMap<String, QueryResultRowItem>;
#[derive(Debug, Clone)]
pub enum QueryResultRowItem {
    Null,
    Integer(i64),
    Real(f64),
    Text(String),
    Blob(Vec<u8>),
}

impl QueryResultRowItem {
    pub fn extract_timestamp(&self, parse_timestamp: bool) -> String {
        if let QueryResultRowItem::Integer(unix_timestamp) = self {
            if parse_timestamp {
                // Creates a new SystemTime from the specified number of whole seconds
                let d = UNIX_EPOCH + Duration::from_millis(unix_timestamp.to_u64().unwrap());
                // Create DateTime from SystemTime
                time::OffsetDateTime::from(d).format(&well_known::Rfc3339).unwrap()
            } else {
                unix_timestamp.to_string()
            }
        } else {
            self.to_string()
        }
    }
}

impl ToString for QueryResultRowItem {
    fn to_string(&self) -> String {
        match self {
            QueryResultRowItem::Null => "null".to_string(),
            QueryResultRowItem::Integer(v) => v.to_string(),
            QueryResultRowItem::Real(v) => v.to_string(),
            QueryResultRowItem::Text(v) => v.to_string(),
            QueryResultRowItem::Blob(_) => "byte array".to_string(), //todo: support
        }
    }
}

impl Serialize for QueryResultRowItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            QueryResultRowItem::Integer(v) => serializer.serialize_i64(*v),
            QueryResultRowItem::Real(v) => serializer.serialize_f64(*v),
            QueryResultRowItem::Text(v) => serializer.serialize_str(v),
            QueryResultRowItem::Blob(v) => serializer.serialize_bytes(v),
            QueryResultRowItem::Null => serializer.serialize_none(),
        }
    }
}
