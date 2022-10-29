use serde::Serialize;

use crate::lib::types::ParsedKafkaRecord;

#[derive(Serialize, Debug)]
pub struct GetPageResponse {
    pub records: Vec<ParsedKafkaRecord>,
    #[serde(rename="nextPage")]    
    pub next_page: Option<usize>,
    #[serde(rename="prevPage")]
    pub prev_page: Option<usize>,
}
