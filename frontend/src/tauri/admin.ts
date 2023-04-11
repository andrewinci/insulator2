import { invoke } from "@tauri-apps/api";
import { ConsumerGroupInfo, ConsumerOffsetConfiguration, PartitionOffset, TopicInfo } from "../models/kafka";
import { useNotification } from "../hooks/use-notification";
import { useQuery } from "@tanstack/react-query";

export const useListTopics = (clusterId: string) => {
  const { withNotification } = useNotification();
  return useQuery(["listTopics", clusterId], () =>
    withNotification({
      action: () =>
        invoke<{ name: string }[]>("list_topics", { clusterId }).then((topics) => topics.map((t) => t.name)),
      successTitle: "List of topics loaded",
    })
  );
};

export const useAdmin = () => {
  const { withNotification } = useNotification();
  return {
    /// ßSet the consumer group offsets
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
    /// Get the consumer group state. i.e. stable, empty, unknown
    getConsumerGroupState: (clusterId: string, consumerGroupName: string): Promise<string> =>
      withNotification({ action: () => invoke<string>("get_consumer_group_state", { clusterId, consumerGroupName }) }),
    ///
    describeConsumerGroup: (
      clusterId: string,
      consumerGroupName: string,
      ignoreCache: boolean
    ): Promise<ConsumerGroupInfo> =>
      withNotification({
        action: () =>
          invoke<ConsumerGroupInfo>("describe_consumer_group", { clusterId, consumerGroupName, ignoreCache }),
      }),
    ///
    getConsumerGroups: (clusterId: string): Promise<string[]> =>
      withNotification({
        action: () => invoke<string[]>("list_consumer_groups", { clusterId }),
        successTitle: "List of consumer groups loaded",
      }),
    /// create topic
    createTopic: (
      clusterId: string,
      topicName: string,
      partitions: number,
      isr: number,
      compacted: boolean
    ): Promise<void> =>
      withNotification({
        action: () => invoke<void>("create_topic", { clusterId, topicName, partitions, isr, compacted }),
        successTitle: `Topic ${topicName} created`,
      }),
    /// get topic info
    getTopicInfo: (clusterId: string, topicName: string): Promise<TopicInfo> =>
      withNotification({ action: () => invoke<TopicInfo>("get_topic_info", { clusterId, topicName }) }),

    /// get last topic offset
    getLastOffsets: (clusterId: string, topicNames: [string]): Promise<Record<string, [PartitionOffset]>> =>
      withNotification({
        action: () => invoke<Record<string, [PartitionOffset]>>("get_last_offsets", { clusterId, topicNames }),
      }),

    /// delete a topic
    deleteTopic: (clusterId: string, topicName: string): Promise<void> =>
      withNotification({
        action: () => invoke<void>("delete_topic", { clusterId, topicName }),
        successDescription: `Topic ${topicName} deleted`,
        showInModal: true,
      }),

    /// delete a consumer group
    deleteConsumerGroup: (clusterId: string, consumerGroupName: string): Promise<void> =>
      withNotification({
        action: () => invoke<void>("delete_consumer_group", { clusterId, consumerGroupName }),
        successTitle: `Consumer group ${consumerGroupName} deleted`,
        showInModal: true,
      }),
  };
};
