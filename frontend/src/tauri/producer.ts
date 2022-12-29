import { invoke } from "@tauri-apps/api";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const produceRecord = (clusterId: string, topic: string, key: string, value: string | null): Promise<void> =>
  invoke<void>("produce_record", { clusterId, topic, key, value }).catch((err: TauriError) =>
    addNotification({ type: "error", title: "Produce record", description: format(err) })
  );
