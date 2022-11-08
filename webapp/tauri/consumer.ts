import { invoke } from "@tauri-apps/api";
import { ConsumerSettingsFrom, ConsumerState, KafkaRecord } from "../models/kafka";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const getConsumerState = (clusterId: string, topic: string): Promise<ConsumerState> =>
  invoke<ConsumerState>("get_consumer_state", { clusterId, topic }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Get Kafka consumer state", description: format(err) });
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

type GetRecordsPageResponse = {
  records: KafkaRecord[];
  nextPage?: number;
  prevPage?: number;
};

export const getRecordsPage = (
  clusterId: string,
  topic: string,
  pageNumber: number,
  query?: string
): Promise<GetRecordsPageResponse> =>
  invoke<GetRecordsPageResponse>("get_records_page", { clusterId, topic, query, pageNumber }).catch(
    (err: TauriError) => {
      addNotification({ type: "error", title: "Get Kafka records page", description: format(err) });
      throw err;
    }
  );
