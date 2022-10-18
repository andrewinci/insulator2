use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Schema {
    pub subject: String,
    pub id: i32,
    pub version: i32,
    pub schema: String,
}

#[derive(Clone)]
pub struct BasicAuth {
    pub username: String,
    pub password: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub(super) struct GetSchemaByIdResult {
    pub schema: String,
}
