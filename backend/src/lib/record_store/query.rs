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
