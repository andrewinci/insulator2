import { invoke } from "@tauri-apps/api";
import { ConsumerGroupInfo, ConsumerSettingsFrom, PartitionOffset, TopicInfo } from "../models/kafka";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const setConsumerGroup = (
  clusterId: string,
  consumerGroupName: string,
  topics: string[],
  offsetConfig: ConsumerSettingsFrom
): Promise<void> => {
  return invoke<void>("set_consumer_group", { clusterId, consumerGroupName, topics, offsetConfig }).catch(
    (err: TauriError) => {
      addNotification({
        type: "error",
        title: `Unable to setup the consumer group ${consumerGroupName}`,
        description: format(err),
      });
      throw err;
    }
  );
};

export const getConsumerGroupState = (clusterId: string, consumerGroupName: string): Promise<string> => {
  return invoke<string>("get_consumer_group_state", { clusterId, consumerGroupName }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to get the consumer group state`,
      description: format(err),
    });
    throw err;
  });
};

export const describeConsumerGroup = (
  clusterId: string,
  consumerGroupName: string,
  ignoreCache: boolean
): Promise<ConsumerGroupInfo> => {
  return invoke<ConsumerGroupInfo>("describe_consumer_group", { clusterId, consumerGroupName, ignoreCache }).catch(
    (err: TauriError) => {
      addNotification({
        type: "error",
        title: `Unable to describe the consumer group`,
        description: format(err),
      });
      throw err;
    }
  );
};

export const getConsumerGroups = (clusterId: string): Promise<string[]> => {
  return invoke<string[]>("list_consumer_groups", { clusterId }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to retrieve the list of consumer groups`,
      description: format(err),
    });
    throw err;
  });
};

export const createTopic = (
  clusterId: string,
  topicName: string,
  partitions: number,
  isr: number,
  compacted: boolean
): Promise<void> => {
  return invoke<void>("create_topic", { clusterId, topicName, partitions, isr, compacted }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to create the new topic`,
      description: format(err),
    });
    throw err;
  });
};

export const listTopics = (clusterId: string): Promise<string[]> =>
  invoke<{ name: string }[]>("list_topics", { clusterId })
    .then((topics) => topics.map((t) => t.name))
    .catch((err: TauriError) => {
      addNotification({
        type: "error",
        title: `Unable to retrieve the list of topics`,
        description: format(err),
      });
      throw err;
    });

export const getTopicInfo = (clusterId: string, topicName: string): Promise<TopicInfo> =>
  invoke<TopicInfo>("get_topic_info", { clusterId, topicName }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to retrieve topic info`,
      description: format(err),
    });
    throw err;
  });

export const deleteTopic = (clusterId: string, topicName: string): Promise<void> =>
  invoke<void>("delete_topic", { clusterId, topicName }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to delete the topic`,
      description: format(err),
    });
    throw err;
  });

export const getLastOffsets = (clusterId: string, topicNames: [string]): Promise<Record<string, [PartitionOffset]>> =>
  invoke<Record<string, [PartitionOffset]>>("get_last_offsets", { clusterId, topicNames }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to retrieve the last offset`,
      description: format(err),
    });
    throw err;
  });

export const deleteConsumerGroup = (clusterId: string, consumerGroupName: string): Promise<void> =>
  invoke<void>("delete_consumer_group", { clusterId, consumerGroupName }).catch((err: TauriError) => {
    addNotification({
      type: "error",
      title: `Unable to delete the consumer group`,
      description: format(err),
    });
    throw err;
  });
