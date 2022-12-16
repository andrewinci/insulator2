use std::collections::HashMap;

use apache_avro::schema::{Name, Schema as AvroSchema};
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

#[derive(Debug, Clone)]
pub struct ResolvedAvroSchema {
    pub schema: AvroSchema,
    pub resolved_schemas: HashMap<Name, AvroSchema>,
}
