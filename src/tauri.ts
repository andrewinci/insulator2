import { invoke } from "@tauri-apps/api";
import { Cluster, ConsumerState, KafkaRecord, SchemaRegistry, SchemaVersion, TopicInfo } from "./models/kafka";
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

export const getSchemaNamesList = (config: SchemaRegistry): Promise<string[]> => {
  return invoke<string[]>("list_subjects", { config });
};

export const getSchemaVersions = (subjectName: string, config: SchemaRegistry): Promise<SchemaVersion[]> =>
  invoke<SchemaVersion[]>("get_schema", { subjectName, config })
    .then((res) => {
      //success(`${res.length} schema version found for ${subjectName}`);
      return res;
    })
    .catch((err: TauriError) => {
      addNotification({ type: "error", title: "Schema registry", description: format(err) });
      throw err;
    });

/** Kafka API **/

export const getTopicNamesList = (cluster: Cluster): Promise<string[]> =>
  invoke<TopicInfo[]>("list_topic", { cluster })
    .then((topics) => topics.map((t) => t.name))
    .catch((err: TauriError) => {
      addNotification({
        type: "error",
        title: `Unable to retrieve the list of topics for "${cluster?.name}"`,
        description: format(err),
      });
      throw err;
    });

export const getConsumerState = (cluster: Cluster, topic: string): Promise<ConsumerState> =>
  invoke<ConsumerState>("get_consumer_state", { consumer: { cluster_id: cluster.id, topic } }).catch(
    (err: TauriError) => {
      addNotification({ type: "error", title: "Get Kafka consumer state", description: format(err) });
      throw err;
    }
  );

export const getRecord = (index: number, cluster: Cluster, topic: string): Promise<KafkaRecord> =>
  invoke<KafkaRecord>("get_record", { consumer: { cluster_id: cluster.id, topic }, index }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka record", description: format(err) });
    throw err;
  });

export const stopConsumer = (clusterId: string, topic: string): Promise<void> =>
  invoke<void>("stop_consumer", {
    consumer: { cluster_id: clusterId, topic },
  }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Stop Kafka record", description: format(err) })
  );

export const startConsumer = (cluster: Cluster, topic: string): Promise<void> =>
  invoke<void>("start_consumer", {
    config: { cluster, topic, from: { Custom: { start_timestamp: 0 } } },
  }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Start Kafka record", description: format(err) })
  );
