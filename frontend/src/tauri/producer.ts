import { invoke } from "@tauri-apps/api/core";
import { withNotifications } from "./error";

export const produceRecord = (
  clusterId: string,
  topic: string,
  key: string,
  value: string | null,
  mode: "Avro" | "String",
): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("produce_record", { clusterId, topic, key, value, mode }),
    successTitle: `Record with key ${key} produced to topic ${topic}`,
    showInModal: true,
  });
