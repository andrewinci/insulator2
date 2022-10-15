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
    pub offsets: Vec<TopicPartitionOffset>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TopicPartitionOffset {
    pub topic: String,
    pub partition_id: i32,
    pub offset: i64,
}