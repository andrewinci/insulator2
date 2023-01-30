import { invoke } from "@tauri-apps/api";
import { withNotifications } from "./error";

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> =>
  withNotifications(
    () =>
      invoke<void>("export_datastore", {
        clusterId,
        outputPath,
      }),
    `Database successfully exported to ${outputPath}`
  );
