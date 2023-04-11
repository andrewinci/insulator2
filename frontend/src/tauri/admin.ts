import { invoke } from "@tauri-apps/api";
import { ConsumerGroupInfo, ConsumerOffsetConfiguration, PartitionOffset, TopicInfo } from "../models/kafka";
import { withNotifications } from "./error";
import { useNotification } from "../hooks/use-notification";

export const useAdmin = () => {
  const { withNotification } = useNotification();
  return {
    setConsumerGroup: (
      clusterId: string,
      consumerGroupName: string,
      topics: string[],
      offsetConfig: ConsumerOffsetConfiguration
    ): Promise<void> =>
      withNotification({
        action: () => invoke<void>("set_consumer_group", { clusterId, consumerGroupName, topics, offsetConfig }),
        successTitle: `Consumer group ${consumerGroupName} updated`,
      }),
  };
};

export const getConsumerGroupState = (clusterId: string, consumerGroupName: string): Promise<string> =>
  withNotifications({ action: () => invoke<string>("get_consumer_group_state", { clusterId, consumerGroupName }) });

export const describeConsumerGroup = (
  clusterId: string,
  consumerGroupName: string,
  ignoreCache: boolean
): Promise<ConsumerGroupInfo> =>
  withNotifications({
    action: () => invoke<ConsumerGroupInfo>("describe_consumer_group", { clusterId, consumerGroupName, ignoreCache }),
  });

export const getConsumerGroups = (clusterId: string): Promise<string[]> =>
  withNotifications({
    action: () => invoke<string[]>("list_consumer_groups", { clusterId }),
    successTitle: "List of consumer groups loaded",
  });

export const createTopic = (
  clusterId: string,
  topicName: string,
  partitions: number,
  isr: number,
  compacted: boolean
): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("create_topic", { clusterId, topicName, partitions, isr, compacted }),
    successTitle: `Topic ${topicName} created`,
  });

export const listTopics = (clusterId: string): Promise<string[]> =>
  withNotifications({
    action: () => invoke<{ name: string }[]>("list_topics", { clusterId }).then((topics) => topics.map((t) => t.name)),
    successTitle: "List of topics loaded",
  });

export const getTopicInfo = (clusterId: string, topicName: string): Promise<TopicInfo> =>
  withNotifications({ action: () => invoke<TopicInfo>("get_topic_info", { clusterId, topicName }) });

export const getLastOffsets = (clusterId: string, topicNames: [string]): Promise<Record<string, [PartitionOffset]>> =>
  withNotifications({
    action: () => invoke<Record<string, [PartitionOffset]>>("get_last_offsets", { clusterId, topicNames }),
  });

export const deleteTopic = (clusterId: string, topicName: string): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("delete_topic", { clusterId, topicName }),
    successDescription: `Topic ${topicName} deleted`,
    showInModal: true,
  });

export const deleteConsumerGroup = (clusterId: string, consumerGroupName: string): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("delete_consumer_group", { clusterId, consumerGroupName }),
    successTitle: `Consumer group ${consumerGroupName} deleted`,
    showInModal: true,
  });
