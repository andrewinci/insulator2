import { invoke } from "@tauri-apps/api";
import { Subject } from "../models";
import { withNotifications } from "./error";

export const listSubjects = (clusterId: string): Promise<string[]> =>
  withNotifications({
    action: () => invoke<string[]>("list_subjects", { clusterId }),
    successTitle: "List of subjects loaded",
  });

export const getSubject = (clusterId: string, subjectName: string): Promise<Subject> =>
  withNotifications({ action: () => invoke<Subject>("get_subject", { clusterId, subjectName }) });

export const deleteSubject = (clusterId: string, subjectName: string): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("delete_subject", { clusterId, subjectName }),
    successTitle: `Subject ${subjectName} deleted`,
    showInModal: true,
  });

export const deleteSubjectVersion = (clusterId: string, subjectName: string, version: number): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("delete_subject_version", { clusterId, subjectName, version }),
    successTitle: `Version ${version} of subject ${subjectName} deleted`,
    showInModal: true,
  });

export const postSchema = (clusterId: string, subjectName: string, schema: string): Promise<void> =>
  withNotifications({
    action: () => invoke<void>("post_schema", { clusterId, subjectName, schema }),
    successTitle: `New version for ${subjectName} created`,
  });
