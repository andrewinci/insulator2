use async_trait::async_trait;
use log::{debug, warn};
use std::{collections::HashMap, time::Duration, vec};

use super::{
    types::{PartitionInfo, PartitionOffset, Topic, TopicInfo},
    KafkaAdmin, Partition,
};
use crate::lib::error::{Error, Result};
use rdkafka::{admin::ResourceSpecifier, Offset, TopicPartitionList};
use rdkafka::{
    admin::{AdminOptions, NewTopic, TopicReplication},
    consumer::Consumer,
};

#[async_trait]
pub trait TopicAdmin {
    // topics
    fn list_topics(&self) -> Result<Vec<Topic>>;
    fn get_topic(&self, topic_name: &str) -> Result<Topic>;
    async fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo>;
    async fn create_topic(&self, topic_name: &str, partitions: i32, isr: i32, compacted: bool) -> Result<()>;
    fn get_last_offsets(&self, topic_names: &[&str]) -> Result<HashMap<String, Vec<PartitionOffset>>>;
}

#[async_trait]
impl TopicAdmin for KafkaAdmin {
    fn list_topics(&self) -> Result<Vec<Topic>> {
        self.internal_list_topics(None)
    }

    fn get_topic(&self, topic_name: &str) -> Result<Topic> {
        let topic_list = self.internal_list_topics(Some(topic_name))?;
        if let Some(topic) = topic_list.first() {
            Ok(topic.to_owned())
        } else {
            warn!(
                "Topic not found or more than one topic with the same name {}",
                topic_name
            );
            Err(Error::Kafka {
                message: "Topic not found".into(),
            })
        }
    }

    async fn get_topic_info(&self, topic_name: &str) -> Result<TopicInfo> {
        let topic = self.get_topic(topic_name)?;

        // retrieve the last offsets
        let mut tp = TopicPartitionList::new();
        (0..topic.partitions.len()).for_each(|p_id| {
            tp.add_partition_offset(topic_name, p_id as i32, Offset::End)
                .expect("Unable to add partition offset");
        });
        let Topic { name, partitions } = topic;
        Ok(TopicInfo {
            name: name.to_string(),
            partitions: partitions
                .iter()
                .map(|p| PartitionInfo {
                    id: p.id,
                    isr: p.isr,
                    replicas: p.replicas,
                })
                .collect(),
            configurations: self.get_topic_configuration(topic_name).await?,
        })
    }

    // return a list in which the index is the partition id and the value is the offset
    fn get_last_offsets(&self, topic_names: &[&str]) -> Result<HashMap<String, Vec<PartitionOffset>>> {
        let all_partitions = self.get_all_topic_partition_list(false)?;
        let mut topic_partition_list = TopicPartitionList::new();
        for topic in topic_names {
            all_partitions.elements_for_topic(topic).iter().for_each(|tpo| {
                topic_partition_list
                    .add_partition_offset(*topic, tpo.partition(), Offset::End)
                    .expect("Unable to add the offset to the list");
            })
        }
        let offsets = self
            .consumer
            .offsets_for_times(topic_partition_list, Duration::from_secs(60))?;
        let mut res = HashMap::<String, Vec<PartitionOffset>>::new();
        offsets.elements().iter().for_each(|t| {
            if !res.contains_key(t.topic()) {
                res.insert(t.topic().into(), vec![]);
            }
            let partition_offsets = res.get_mut(t.topic()).unwrap();
            partition_offsets.push(PartitionOffset {
                partition_id: t.partition(),
                offset: t.offset().to_raw().unwrap(),
            })
        });
        Ok(res)
    }

    async fn create_topic(&self, name: &str, num_partitions: i32, isr: i32, compacted: bool) -> Result<()> {
        let new_topic = NewTopic {
            name,
            num_partitions,
            config: vec![("cleanup.policy", if compacted { "compact" } else { "delete" })],
            replication: TopicReplication::Fixed(isr),
        };
        let res = self
            .admin_client
            .create_topics(vec![&new_topic], &AdminOptions::default())
            .await?;
        // delete cache of topics/partitions map
        *self.all_topic_partition_list.lock().unwrap() = TopicPartitionList::new();
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
}

impl KafkaAdmin {
    async fn get_topic_configuration(&self, topic_name: &str) -> Result<HashMap<String, Option<String>>> {
        debug!("Retrieving the topic configurations");
        let responses = self
            .admin_client
            .describe_configs([&ResourceSpecifier::Topic(topic_name)], &AdminOptions::default())
            .await?;
        let mut configurations = HashMap::<String, Option<String>>::new();
        if let Some(Ok(topic_config)) = responses.first() {
            topic_config.entries.iter().for_each(|c| {
                configurations.insert(c.name.clone(), c.value.as_ref().cloned());
            })
        }
        Ok(configurations)
    }

    fn internal_list_topics(&self, topic: Option<&str>) -> Result<Vec<Topic>> {
        let topics: Vec<_> = self
            .consumer
            .fetch_metadata(topic, self.timeout)?
            .topics()
            .iter()
            .map(|t| Topic {
                name: t.name().to_string(),
                partitions: t
                    .partitions()
                    .iter()
                    .map(|m| Partition {
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
