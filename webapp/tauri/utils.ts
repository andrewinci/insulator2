import { invoke } from "@tauri-apps/api";
import { addNotification } from "../providers";
import { waitEvent } from "./event_listeners";

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> => {
  try {
    const response = waitEvent("export_datastore", `${clusterId}-${outputPath}`);
    await invoke<void>("export_datastore", {
      clusterId,
      outputPath,
    });
    await response;
  } catch (err) {
    addNotification({ type: "error", title: "Database export failed", description: "" });
    throw err;
  }
};
