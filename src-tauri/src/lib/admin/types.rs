use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PartitionInfo {
    pub id: i32,
    pub isr: usize,
    pub replicas: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TopicInfo {
    pub name: String,
    pub partitions: Vec<PartitionInfo>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ConsumerGroupInfo {
    pub name: String,
}

#[derive(Debug)]
struct TopicPartitionOffset {
    topic: String,
    partition_id: i32,
    offset: i64,
}