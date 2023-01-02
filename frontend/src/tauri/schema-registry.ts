import { invoke } from "@tauri-apps/api";
import { Subject } from "../models";
import { addNotification } from "../providers";
import { format, ApiError } from "./error";

export const listSubjects = (clusterId: string): Promise<string[]> =>
  invoke<string[]>("list_subjects", { clusterId }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "List schemas from registry", description: format(err) });
    throw err;
  });

export const getSubject = (clusterId: string, subjectName: string): Promise<Subject> =>
  invoke<Subject>("get_subject", { clusterId, subjectName }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Get schema from registry", description: format(err) });
    throw err;
  });

export const deleteSubject = (clusterId: string, subjectName: string): Promise<void> =>
  invoke<void>("delete_subject", { clusterId, subjectName }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Delete schema", description: format(err) });
    throw err;
  });

export const deleteSubjectVersion = (clusterId: string, subjectName: string, version: number): Promise<void> =>
  invoke<void>("delete_subject_version", { clusterId, subjectName, version }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Delete schema version", description: format(err) });
    throw err;
  });

export const postSchema = (clusterId: string, subjectName: string, schema: string): Promise<void> =>
  invoke<void>("post_schema", { clusterId, subjectName, schema }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Post schema", description: format(err) });
    throw err;
  });
