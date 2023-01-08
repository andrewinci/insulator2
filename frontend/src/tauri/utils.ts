import { invoke } from "@tauri-apps/api";
import { addNotification } from "../providers";

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> => {
  try {
    return await invoke<void>("export_datastore", {
      clusterId,
      outputPath,
    });
  } catch (err) {
    addNotification({ type: "error", title: "Database export failed", description: "" });
    throw err;
  }
};
