import { useMemo, useState } from "react";
import { getTopicList } from "../../kafka";
import { useAppState, notifyAlert, notifySuccess } from "../../providers";
import { ItemList } from "../common";

export const TopicList = ({
  onTopicSelected,
}: {
  onTopicSelected: (topicName: string) => void;
}) => {
  const { appState } = useAppState();
  const [state, setState] = useState<{ topics: string[]; search?: string; loading: boolean }>({
    topics: [],
    loading: true,
  });

  const updateTopicList = () => {
    if (appState.activeCluster) {
      setState({ ...state, loading: true });
      getTopicList(appState.activeCluster)
        .then((topics) => setState({ topics: topics.map((t) => t.name), loading: false }))
        .then((_) => notifySuccess("List of topics successfully retrieved"))
        .catch((err) => {
          notifyAlert(
            `Unable to retrieve the list of topics for cluster "${appState.activeCluster?.name}"`,
            err
          );
          setState({ topics: [], loading: false });
        });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateTopicList(), [appState.activeCluster]);

  return (
    <ItemList
      title="Topics"
      loading={state.loading}
      items={state.topics}
      onItemSelected={onTopicSelected}
      onRefreshList={updateTopicList}
    />
  );
};
