import { useMemo, useState } from "react";
import { Cluster } from "../../models/kafka";
import { useAppState, notifyAlert, notifySuccess } from "../../providers";
import { ItemList } from "../common";

function getSchemaNamesList(_: Cluster): Promise<string[]> {
  return Promise.resolve([]);
  //todo: return invoke<TopicInfo[]>("list_schemas", { cluster });
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
        .catch((err) => {
          notifyAlert(
            `Unable to retrieve the list of schemas for cluster "${appState.activeCluster?.name}"`,
            err
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
