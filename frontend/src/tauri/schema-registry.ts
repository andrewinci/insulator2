import { invoke } from "@tauri-apps/api";
import { Subject } from "../models";
import { withNotifications } from "./error";

export const listSubjects = (clusterId: string): Promise<string[]> =>
  withNotifications(() => invoke<string[]>("list_subjects", { clusterId }), "List of subjects loaded");

export const getSubject = (clusterId: string, subjectName: string): Promise<Subject> =>
  withNotifications(() => invoke<Subject>("get_subject", { clusterId, subjectName }));

export const deleteSubject = (clusterId: string, subjectName: string): Promise<void> =>
  withNotifications(() => invoke<void>("delete_subject", { clusterId, subjectName }), `Subject ${subjectName} deleted`);

export const deleteSubjectVersion = (clusterId: string, subjectName: string, version: number): Promise<void> =>
  withNotifications(
    () => invoke<void>("delete_subject_version", { clusterId, subjectName, version }),
    `Version ${version} of subject ${subjectName} deleted`
  );

export const postSchema = (clusterId: string, subjectName: string, schema: string): Promise<void> =>
  withNotifications(
    () => invoke<void>("post_schema", { clusterId, subjectName, schema }),
    `New version for ${subjectName} created`
  );
