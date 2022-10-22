use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Subject {
    pub subject: String,
    pub compatibility: String,
    pub versions: Vec<Schema>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Schema {
    pub id: i32,
    pub version: i32,
    pub schema: String,
}

#[derive(Clone)]
pub struct BasicAuth {
    pub username: String,
    pub password: Option<String>,
}