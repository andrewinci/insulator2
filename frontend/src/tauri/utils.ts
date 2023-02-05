import { invoke } from "@tauri-apps/api";
import { withNotifications } from "./error";
import { notifyFailure, notifySuccess } from "../helpers/notification";
import { fs } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> =>
  await withNotifications({
    action: () =>
      invoke<void>("export_datastore", {
        clusterId,
        outputPath,
      }),
    successDescription: `Database successfully exported to ${outputPath}`,
  });

export const saveTextFile = async (subject: string, schema: string) => {
  const path = await save({
    defaultPath: `${subject}.json`,
  });
  if (path) {
    try {
      await fs.writeTextFile(path, schema);
      notifySuccess(`Schema saved to ${path}`);
    } catch (err) {
      notifyFailure("Unable to save the schema locally", JSON.stringify(err));
    }
  }
};
