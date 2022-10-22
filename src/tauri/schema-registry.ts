import { invoke } from "@tauri-apps/api";
import { Subject } from "../models";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const listSubjects = (clusterId: string): Promise<string[]> => {
  return invoke<string[]>("list_subjects", { clusterId });
};

export const getSubject = (clusterId: string, subjectName: string): Promise<Subject> =>
  invoke<Subject>("get_subject", { clusterId, subjectName })
    .then((res) => {
      //success(`${res.length} schema version found for ${subjectName}`);
      return res;
    })
    .catch((err: TauriError) => {
      addNotification({ type: "error", title: "Schema registry", description: format(err) });
      throw err;
    });
