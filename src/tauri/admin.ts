import { invoke } from "@tauri-apps/api";
import { ConsumerGroupInfo, TopicInfo } from "../models/kafka";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const describeConsumerGroup = (
  clusterId: string,
  consumerGroupName: string,
  useCache: boolean
): Promise<ConsumerGroupInfo> => {
  return invoke<ConsumerGroupInfo>("describe_consumer_group", { clusterId, consumerGroupName, useCache }).catch(
    (err: TauriError) => {
      console.error(err);
      addNotification({
        type: "error",
        title: `Unable to describe the consumer group`,
        description: format(err),
      });
      throw err;
    }
  );
};

export const getConsumerGroups = (clusterId: string, force: boolean): Promise<string[]> => {
  return invoke<string[]>("list_consumer_groups", { clusterId, force }).catch((err: TauriError) => {
    console.error(err);
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
    console.error(err);
    addNotification({
      type: "error",
      title: `Unable to create the new topic`,
      description: format(err),
    });
    throw err;
  });
};

export const getTopicNamesList = (clusterId: string, force?: boolean): Promise<string[]> =>
  invoke<TopicInfo[]>("list_topics", { clusterId, force })
    .then((topics) => topics.map((t) => t.name))
    .catch((err: TauriError) => {
      console.error(err);
      addNotification({
        type: "error",
        title: `Unable to retrieve the list of topics`,
        description: format(err),
      });
      throw err;
    });
