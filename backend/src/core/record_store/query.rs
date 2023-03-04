use std::collections::HashMap;

use serde::Serialize;

use crate::core::types::ParsedKafkaRecord;

use super::{error::StoreResult, StoreError};

#[derive(Debug)]
pub struct Query {
    pub cluster_id: String,
    pub topic_name: String,
    pub offset: i64,
    pub limit: i64,
    pub query_template: String,
}

impl Query {
    pub const SELECT_WITH_OFFSET_LIMIT_QUERY : &str = "SELECT partition, offset, timestamp, key, payload FROM {:topic} ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";

    #[cfg(test)]
    pub fn select_any(cluster_id: &str, topic_name: &str, offset: i64, limit: i64) -> Query {
        Query {
            cluster_id: cluster_id.into(),
            topic_name: topic_name.into(),
            limit,
            offset,
            query_template: Query::SELECT_WITH_OFFSET_LIMIT_QUERY.into(),
        }
    }
}

pub type QueryRow = HashMap<String, QueryRowValue>;
#[derive(Debug, Clone)]
pub enum QueryRowValue {
    Null,
    Integer(i64),
    Real(f64),
    Text(String),
    Blob(Vec<u8>),
}

impl ToString for QueryRowValue {
    fn to_string(&self) -> String {
        match self {
            QueryRowValue::Null => "null".to_string(),
            QueryRowValue::Integer(v) => v.to_string(),
            QueryRowValue::Real(v) => v.to_string(),
            QueryRowValue::Text(v) => v.to_string(),
            QueryRowValue::Blob(_) => "byte array".to_string(), //todo: support
        }
    }
}

impl Serialize for QueryRowValue {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            QueryRowValue::Integer(v) => serializer.serialize_i64(*v),
            QueryRowValue::Real(v) => serializer.serialize_f64(*v),
            QueryRowValue::Text(v) => serializer.serialize_str(v),
            QueryRowValue::Blob(v) => serializer.serialize_bytes(v),
            QueryRowValue::Null => serializer.serialize_none(),
        }
    }
}
