import { invoke } from "@tauri-apps/api";
import { Subject } from "../models";
import { useNotification } from "../hooks/use-notification";
import { useQuery } from "@tanstack/react-query";

export const useListSubjects = (clusterId: string) => {
  const { withNotification } = useNotification();
  return useQuery(["getSchemaNamesList", clusterId], () =>
    withNotification({
      action: () => invoke<string[]>("list_subjects", { clusterId }),
      successTitle: "List of subjects loaded",
    })
  );
};

export const useGetSubject = (clusterId: string, subjectName: string) => {
  const { withNotification } = useNotification();
  return useQuery(["getSchemaVersions", clusterId, subjectName], () =>
    withNotification({ action: () => invoke<Subject>("get_subject", { clusterId, subjectName }) })
  );
};

export const useSchemaRegistry = () => {
  const { withNotification } = useNotification();
  return {
    deleteSubject: (clusterId: string, subjectName: string): Promise<void> =>
      withNotification({
        action: () => invoke<void>("delete_subject", { clusterId, subjectName }),
        successTitle: `Subject ${subjectName} deleted`,
        showInModal: true,
      }),

    deleteSubjectVersion: (clusterId: string, subjectName: string, version: number): Promise<void> =>
      withNotification({
        action: () => invoke<void>("delete_subject_version", { clusterId, subjectName, version }),
        successTitle: `Version ${version} of subject ${subjectName} deleted`,
        showInModal: true,
      }),

    postSchema: (clusterId: string, subjectName: string, schema: string): Promise<void> =>
      withNotification({
        action: () => invoke<void>("post_schema", { clusterId, subjectName, schema }),
        successTitle: `New version for ${subjectName} created`,
      }),
  };
};
