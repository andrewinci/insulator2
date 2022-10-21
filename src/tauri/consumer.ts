import { invoke } from "@tauri-apps/api";
import { ConsumerSettingsFrom, ConsumerState, KafkaRecord } from "../models/kafka";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const getConsumerState = (clusterId: string, topic: string): Promise<ConsumerState> =>
  invoke<ConsumerState>("get_consumer_state", { clusterId, topic }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka consumer state", description: format(err) });
    throw err;
  });

export const getRecord = (index: number, clusterId: string, topic: string): Promise<KafkaRecord> =>
  invoke<KafkaRecord>("get_record", { index, clusterId, topic }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka record", description: format(err) });
    throw err;
  });

export const stopConsumer = (clusterId: string, topic: string): Promise<void> =>
  invoke<void>("stop_consumer", { clusterId, topic }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Stop Kafka record", description: format(err) })
  );

export const startConsumer = (clusterId: string, topic: string, offsetConfig: ConsumerSettingsFrom): Promise<void> =>
  invoke<void>("start_consumer", {
    clusterId,
    offsetConfig,
    topic,
  }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Start Kafka record", description: format(err) })
  );
