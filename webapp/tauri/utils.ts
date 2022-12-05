import { addNotification } from "@providers";
import { invoke } from "@tauri-apps/api";

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> => {
  try {
    return await invoke<void>("export_datastore", {
      clusterId,
      outputPath,
    });
  } catch (err) {
    addNotification({ type: "error", title: "Database export failed", description: "" });
    console.log(err);
    throw err;
  }
};
