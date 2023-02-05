import { invoke } from "@tauri-apps/api";
import { ConsumerConfiguration, ConsumerState, KafkaRecord } from "../models/kafka";
import { withNotifications } from "./error";

export const getConsumerState = (clusterId: string, topic: string): Promise<ConsumerState> =>
  withNotifications({
    action: () => invoke<ConsumerState>("get_consumer_state", { clusterId, topic }),
  });

export const stopConsumer = (clusterId: string, topic: string): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("stop_consumer", { clusterId, topic }),
    successTitle: `Consumer for topic ${topic} stopped`,
  });

export const startConsumer = (clusterId: string, topic: string, config: ConsumerConfiguration): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("start_consumer", { clusterId, topic, config }),
    successTitle: `Consumer for topic ${topic} started`,
  });

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
  withNotifications({
    action: () => invoke<GetRecordsPageResponse>("get_records_page", { clusterId, topic, query, pageNumber }),
  });

type ExportOptions = {
  query: string;
  outputPath: string;
  limit?: number;
  overwrite: boolean;
  parseTimestamp: boolean;
};

export const exportRecords = (clusterId: string, topic: string, options: ExportOptions): Promise<void> =>
  withNotifications({
    successTitle: `Records from ${topic} exported`,
    action: () =>
      invoke<void>("export_records", {
        clusterId,
        topic,
        options,
      }),
  });
