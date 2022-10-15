import { invoke } from "@tauri-apps/api";
import { Cluster, ConsumerSettingsFrom, ConsumerState, KafkaRecord, SchemaVersion, TopicInfo } from "./models/kafka";
import { addNotification, AppState } from "./providers";

export type TauriError = {
  errorType: string;
  message: string;
};

export const format = ({ errorType, message }: TauriError) => `${errorType}: ${message}`;

/** Configurations **/

export const getConfiguration = (): Promise<AppState> =>
  invoke<AppState>("get_configuration").catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to retrieve the user config", description: format(err) });
    throw err;
  });

export const setConfiguration = (configuration: AppState): Promise<AppState> =>
  invoke<AppState>("write_configuration", { configuration }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to update the user config", description: format(err) });
    throw err;
  });

/** Schema Registry API **/

export const getSchemaNamesList = (clusterId: string): Promise<string[]> => {
  return invoke<string[]>("list_subjects", { clusterId });
};

export const getSchemaVersions = (clusterId: string, subjectName: string): Promise<SchemaVersion[]> =>
  invoke<SchemaVersion[]>("get_schema", { clusterId, subjectName })
    .then((res) => {
      //success(`${res.length} schema version found for ${subjectName}`);
      return res;
    })
    .catch((err: TauriError) => {
      addNotification({ type: "error", title: "Schema registry", description: format(err) });
      throw err;
    });

/** Kafka API **/

export const getConsumerGroups = (clusterId: string) => {
  return invoke<{ name: string }[]>("list_consumer_groups", { clusterId }).catch((err: TauriError) => {
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

export const getTopicNamesList = (cluster: Cluster, force?: boolean): Promise<string[]> =>
  invoke<TopicInfo[]>("list_topics", { clusterId: cluster.id, force })
    .then((topics) => topics.map((t) => t.name))
    .catch((err: TauriError) => {
      console.error(err);
      addNotification({
        type: "error",
        title: `Unable to retrieve the list of topics for "${cluster?.name}"`,
        description: format(err),
      });
      throw err;
    });

export const getConsumerState = (cluster: Cluster, topic: string): Promise<ConsumerState> =>
  invoke<ConsumerState>("get_consumer_state", { clusterId: cluster.id, topic }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka consumer state", description: format(err) });
    throw err;
  });

export const getRecord = (index: number, cluster: Cluster, topic: string): Promise<KafkaRecord> =>
  invoke<KafkaRecord>("get_record", { index, clusterId: cluster.id, topic }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka record", description: format(err) });
    throw err;
  });

export const stopConsumer = (clusterId: string, topic: string): Promise<void> =>
  invoke<void>("stop_consumer", { clusterId, topic }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Stop Kafka record", description: format(err) })
  );

export const startConsumer = (cluster: Cluster, topic: string, offsetConfig: ConsumerSettingsFrom): Promise<void> =>
  invoke<void>("start_consumer", {
    clusterId: cluster.id,
    offsetConfig,
    topic,
  }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Start Kafka record", description: format(err) })
  );
