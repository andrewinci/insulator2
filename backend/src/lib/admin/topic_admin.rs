use log::{debug, warn};
use std::{collections::HashMap, vec};

use crate::lib::admin::error::AdminError;

use super::{
    error::AdminResult,
    types::{PartitionInfo, PartitionOffset, Topic, TopicInfo},
    KafkaAdmin, Partition,
};
use rdkafka::{admin::ResourceSpecifier, Offset, TopicPartitionList};
use rdkafka::{
    admin::{AdminOptions, NewTopic, TopicReplication},
    consumer::Consumer,
};

impl KafkaAdmin {
    pub async fn list_topics(&self) -> AdminResult<Vec<Topic>> {
        {
            // delete cache of topics/partitions map
            *self.all_topic_partition_list.write().await = TopicPartitionList::new();
        }
        self.internal_list_topics(None)
    }

    pub fn get_topic(&self, topic_name: &str) -> AdminResult<Topic> {
        let topic_list = self.internal_list_topics(Some(topic_name))?;
        if let Some(topic) = topic_list.first() {
            Ok(topic.to_owned())
        } else {
            warn!(
                "Topic not found or more than one topic with the same name {}",
                topic_name
            );
            Err(AdminError::TopicNotFound(topic_name.to_string()))
        }
    }

    pub async fn delete_topic(&self, topic_name: &str) -> AdminResult<()> {
        debug!("Deleting topic {}", topic_name);
        let res = self
            .admin_client
            .delete_topics(&[topic_name], &AdminOptions::default())
            .await?;
        match res.first() {
            Some(Ok(_)) => Ok(()),
            Some(Err(err)) => Err(err.1.into()),
            None => Err(AdminError::TopicNotFound(topic_name.to_string())),
        }
    }

    pub async fn get_topic_info(&self, topic_name: &str) -> AdminResult<TopicInfo> {
        let topic = self.get_topic(topic_name)?;

        // retrieve the last offsets
        let mut tp = TopicPartitionList::new();
        for p_id in 0..topic.partitions.len() {
            tp.add_partition_offset(topic_name, p_id as i32, Offset::End)?;
        }
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
    pub async fn get_last_offsets(&self, topic_names: &[&str]) -> AdminResult<HashMap<String, Vec<PartitionOffset>>> {
        let all_partitions = self.get_all_topic_partition_list(false).await?;
        let mut topic_partition_list = TopicPartitionList::new();
        for topic in topic_names {
            for tpo in all_partitions.elements_for_topic(topic) {
                topic_partition_list.add_partition_offset(topic, tpo.partition(), Offset::End)?;
            }
        }
        let offsets = self.consumer.offsets_for_times(topic_partition_list, self.timeout)?;
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

    pub async fn create_topic(&self, name: &str, num_partitions: i32, isr: i32, compacted: bool) -> AdminResult<()> {
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
        let res = res
            .first()
            .ok_or_else(|| AdminError::RDKafka("Invalid result from create topic api call.".into()))?;
        match res {
            Ok(_) => {
                debug!("Topic created successfully");
                Ok(())
            }
            Err(err) => {
                warn!("{:?}", err);
                Err(err.1.into())
            }
        }
    }

    pub async fn get_topic_configuration(&self, topic_name: &str) -> AdminResult<HashMap<String, Option<String>>> {
        debug!("Retrieving the topic configurations");
        let responses = self
            .admin_client
            .describe_configs([&ResourceSpecifier::Topic(topic_name)], &AdminOptions::default())
            .await?;
        let mut configurations = HashMap::<String, Option<String>>::new();
        if let Some(Ok(topic_config)) = responses.first() {
            topic_config.entries.iter().for_each(|c| {
                configurations.insert(c.name.clone(), c.value.as_ref().cloned());
            });
        }
        Ok(configurations)
    }

    fn internal_list_topics(&self, topic: Option<&str>) -> AdminResult<Vec<Topic>> {
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
