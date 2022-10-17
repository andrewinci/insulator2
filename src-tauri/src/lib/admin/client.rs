use async_trait::async_trait;
use futures::lock::Mutex;
use log::{ debug, warn, error };
use std::{ time::Duration, vec, sync::Arc };

use super::{ types::{ PartitionInfo, TopicInfo }, ConsumerGroupInfo };
use crate::lib::{
    configuration::{ build_kafka_client_config, ClusterConfig },
    error::{ Error, Result },
    admin::TopicPartitionOffset,
};
use rdkafka::{ admin::AdminClient, TopicPartitionList, Offset };
use rdkafka::{
    admin::{ AdminOptions, NewTopic, TopicReplication },
    client::DefaultClientContext,
    consumer::{ Consumer, StreamConsumer },
};

#[async_trait]
pub trait Admin {
    async fn list_topics(&self, force: bool) -> Result<Vec<TopicInfo>>;
    async fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo>;
    async fn create_topic(&self, topic_name: &str, partitions: i32, isr: i32, compacted: bool) -> Result<()>;
    fn list_consumer_groups(&self) -> Result<Vec<String>>;
    async fn describe_consumer_group(&self, consumer_group_name: &str) -> Result<ConsumerGroupInfo>;
}

pub struct KafkaAdmin {
    config: ClusterConfig,
    timeout: Duration,
    consumer: StreamConsumer,
    admin_client: AdminClient<DefaultClientContext>,
    topics: Arc<Mutex<Vec<TopicInfo>>>,
}

impl KafkaAdmin {
    pub fn new(config: &ClusterConfig) -> KafkaAdmin {
        KafkaAdmin {
            config: config.clone(),
            timeout: Duration::from_secs(30),
            consumer: build_kafka_client_config(config, None)
                .create()
                .expect("Unable to create a consumer for the admin client."),
            admin_client: build_kafka_client_config(config, None).create().expect("Unable to build the admin client"),
            topics: Arc::new(Mutex::new(vec![])),
        }
    }
}

#[async_trait]
impl Admin for KafkaAdmin {
    async fn list_topics(&self, force: bool) -> Result<Vec<TopicInfo>> {
        let mut topics = self.topics.lock().await;
        if force || topics.len() == 0 {
            debug!("Clear topics cache");
            topics.clear();
            topics.extend(self.internal_list_topics(None)?);
        }
        Ok(topics.to_vec())
    }

    async fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo> {
        let topics = self.topics.lock().await;
        if let Some(topic_info) = topics.iter().find(|t| t.name == topic_name) {
            return Ok(topic_info.clone());
        } else {
            let info = self.internal_list_topics(Some(topic_name))?;
            if info.len() == 1 {
                Ok(info.get(0).unwrap().clone())
            } else {
                warn!("Topic not found or more than one topic with the same name {}", topic_name);
                Err(Error::Kafka {
                    message: "Topic not found".into(),
                })
            }
        }
    }

    async fn create_topic(&self, name: &str, num_partitions: i32, isr: i32, compacted: bool) -> Result<()> {
        let new_topic = NewTopic {
            name,
            num_partitions,
            config: vec![("cleanup.policy", if compacted { "compact" } else { "delete" })],
            replication: TopicReplication::Fixed(isr),
        };
        let opts = AdminOptions::new();

        let res = self.admin_client.create_topics(vec![&new_topic], &opts).await?;
        let res = res.get(0).expect("Create topic: missing result");
        match res {
            Ok(_) => {
                debug!("Topic created successfully");
                Ok(())
            }
            Err(err) => {
                warn!("{:?}", err);
                Err(Error::Kafka {
                    message: format!("Unable to create the topic. {} {}", err.0, err.1),
                })
            }
        }
    }

    fn list_consumer_groups(&self) -> Result<Vec<String>> {
        let groups = self.consumer.fetch_group_list(None, self.timeout)?;
        let group_names: Vec<_> = groups
            .groups()
            .iter()
            .map(|g| g.name().to_string())
            .collect();
        Ok(group_names)
    }

    async fn describe_consumer_group(&self, consumer_group_name: &str) -> Result<ConsumerGroupInfo> {
        // create a consumer with the defined consumer_group_name.
        // NOTE: the consumer shouldn't join the consumer group, otherwise it'll cause a re-balance
        debug!("Build the consumer for the consumer group {}", consumer_group_name);
        let consumer: StreamConsumer = build_kafka_client_config(&self.config, Some(consumer_group_name))
            .create()
            .expect("Unable to build the consumer");

        let topics = self.list_topics(false).await?;
        debug!("Assign ALL topics and ALL partitions to the consumer");
        let mut topic_partition_lst = TopicPartitionList::new();
        topics.iter().for_each(|topic|
            topic.partitions.iter().for_each(|partition| {
                topic_partition_lst.add_partition(&topic.name, partition.id);
            })
        );
        consumer.assign(&topic_partition_lst).unwrap();
        debug!("Check any committed offset to the consumer group");
        // allow up to 3 minutes for big clusters and slow connections
        let res = consumer.committed(Duration::from_secs(3 * 60)).unwrap();
        let offsets: Vec<_> = res
            .elements()
            .iter()
            .filter(|tpo| tpo.offset() != Offset::Invalid)
            .map(|r| TopicPartitionOffset {
                topic: r.topic().into(),
                partition_id: r.partition(),
                offset: map_offset(&r.offset()),
            })
            .collect();
        debug!("Retrieve completed");

        //todo: retrieve consumer group status and active consumers with `fetch_group_list`

        Ok(ConsumerGroupInfo { name: consumer_group_name.into(), offsets })
    }
}

impl KafkaAdmin {
    fn internal_list_topics(&self, topic: Option<&str>) -> Result<Vec<TopicInfo>> {
        let topics: Vec<TopicInfo> = self.consumer
            .fetch_metadata(topic, self.timeout)?
            .topics()
            .iter()
            .map(|t| TopicInfo {
                name: t.name().to_string(),
                partitions: t
                    .partitions()
                    .iter()
                    .map(|m| PartitionInfo {
                        id: m.id(),
                        isr: m.isr().len(),
                        replicas: m.replicas().len(),
                    })
                    .collect(),
            })
            .collect();
        Ok(topics)
    }
}

fn map_offset(offset: &Offset) -> i64 {
    match offset {
        Offset::Beginning => 0,
        Offset::Offset(v) => *v,
        _ => {
            error!("Unexpected offset {:?}. Returning -1.", offset);
            -1
        }
    }
}