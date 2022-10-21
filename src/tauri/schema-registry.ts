import { invoke } from "@tauri-apps/api";
import { SchemaVersion } from "../models/kafka";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const getSchemaNamesList = (clusterId: string): Promise<string[]> => {
  return invoke<string[]>("list_subjects", { clusterId });
};

export const getSchemaVersions = (clusterId: string, subjectName: string): Promise<SchemaVersion[]> =>
  invoke<SchemaVersion[]>("get_schema", { clusterId, subjectName })
    .then((res) => {
      //success(`${res.length} schema version found for ${subjectName}`);
      return res;
    })
    .catch((err: TauriError) => {
      addNotification({ type: "error", title: "Schema registry", description: format(err) });
      throw err;
    });
