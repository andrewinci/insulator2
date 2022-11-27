use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct ExportOptions {
    pub query: Option<String>,
    #[serde(rename = "outputPath")]
    pub output_path: String,
    pub limit: Option<i64>,
    #[serde(rename = "parseTimestamp")]
    pub parse_timestamp: bool,
    pub overwrite: bool,
}
