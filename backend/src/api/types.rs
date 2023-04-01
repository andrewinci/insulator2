use serde::Serialize;

use crate::core::record_store::QueryResultRow;

#[derive(Serialize, Debug)]
pub struct GetPageResponse {
    pub records: Vec<QueryResultRow>,
    #[serde(rename = "nextPage")]
    pub next_page: Option<usize>,
    #[serde(rename = "prevPage")]
    pub prev_page: Option<usize>,
}
