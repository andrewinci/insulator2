import { invoke } from "@tauri-apps/api";
import { withNotifications } from "./error";

export const produceRecord = (
  clusterId: string,
  topic: string,
  key: string,
  value: string | null,
  mode: "Avro" | "String"
): Promise<void> =>
  withNotifications(
    () => invoke<void>("produce_record", { clusterId, topic, key, value, mode }),
    `Record with key ${key} produced to topic ${topic}`
  );
