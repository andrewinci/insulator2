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

export const useDescribeConsumerGroup = (clusterId: string, consumerGroupName: string, ignoreCache: boolean) => {
  const { withNotification } = useNotification();
  return useQuery(
    ["describeConsumerGroup", clusterId, consumerGroupName],
    async () => {
      const consumerGroupInfo = withNotification({
        action: () =>
          invoke<ConsumerGroupInfo>("describe_consumer_group", { clusterId, consumerGroupName, ignoreCache }),
      });
      /// Get the consumer group state. i.e. stable, empty, unknown
      const consumerGroupState = withNotification({
        action: () => invoke<string>("get_consumer_group_state", { clusterId, consumerGroupName }),
      });
      const result = await Promise.allSettled([consumerGroupInfo, consumerGroupState]);
      return {
        info: result[0].status === "fulfilled" ? result[0].value : undefined,
        state: result[1].status === "fulfilled" ? result[1].value : undefined,
      };
    },
    { refetchOnWindowFocus: false, refetchOnMount: false }
  );
};

export const useGetConsumerGroups = (clusterId: string) => {
  const { withNotification } = useNotification();
  return useQuery(["getConsumerGroups", clusterId], () =>
    withNotification({
      action: () => invoke<string[]>("list_consumer_groups", { clusterId }),
      successTitle: "List of consumer groups loaded",
    })
  );
};

export const useGetTopicInfo = (clusterId: string, topicName: string) => {
  const { withNotification } = useNotification();
  return useQuery(["getTopicInfo", clusterId, topicName], () =>
    withNotification({ action: () => invoke<TopicInfo>("get_topic_info", { clusterId, topicName }) })
  );
};

export const useGetLastOffsets = (clusterId: string, topicNames: [string]) => {
  const { withNotification } = useNotification();
  return useQuery(["getLastOffset", clusterId, topicNames], () =>
    withNotification({
      action: () => invoke<Record<string, [PartitionOffset]>>("get_last_offsets", { clusterId, topicNames }),
    })
  );
};

export const useAdmin = () => {
  const { withNotification } = useNotification();
  return {
    /// Set the consumer group offsets
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
