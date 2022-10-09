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