use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PartitionInfo {
    pub id: i32,
    pub isr: usize,
    pub replicas: usize,
    pub last_offset: Option<i64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TopicInfo {
    pub name: String,
    pub partitions: Vec<PartitionInfo>,
    pub configurations: HashMap<String, Option<String>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Topic {
    pub name: String,
    pub partitions: Vec<PartitionInfo>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ConsumerGroupInfo {
    pub name: String,
    pub state: String,
    pub offsets: Vec<TopicPartitionOffset>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TopicPartitionOffset {
    pub topic: String,
    pub partition_id: i32,
    pub offset: i64,
}
