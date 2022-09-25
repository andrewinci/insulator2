import { invoke } from "@tauri-apps/api";
import { useMemo, useState } from "react";
import { Cluster } from "../../models/kafka";
import { useAppState, notifyAlert, notifySuccess } from "../../providers";
import { format, TauriError } from "../../tauri";
import { ItemList } from "../common";

function getSchemaNamesList(cluster: Cluster): Promise<string[]> {
  return invoke<string[]>("list_subjects", { config: cluster.schemaRegistry });
}

export const SchemaList = ({
  onTopicSelected,
}: {
  onTopicSelected: (topicName: string) => void;
}) => {
  const { appState } = useAppState();
  const [state, setState] = useState<{ schemas: string[]; search?: string; loading: boolean }>({
    schemas: [],
    loading: true,
  });

  const updateSchemasList = () => {
    if (appState.activeCluster) {
      setState({ ...state, loading: true });
      getSchemaNamesList(appState.activeCluster)
        .then((schemas) => setState({ schemas, loading: false }))
        .then((_) => notifySuccess("List of schemas successfully retrieved"))
        .catch((err: TauriError) => {
          notifyAlert(
            `Unable to retrieve the list of schemas for "${appState.activeCluster?.name}"`,
            format(err)
          );
          setState({ schemas: [], loading: false });
        });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateSchemasList(), [appState.activeCluster]);

  return (
    <ItemList
      title="Schemas"
      loading={state.loading}
      items={state.schemas}
      onItemSelected={onTopicSelected}
      onRefreshList={updateSchemasList}
    />
  );
};
