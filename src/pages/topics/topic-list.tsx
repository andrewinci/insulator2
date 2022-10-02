import { useMemo, useState } from "react";
import { useCurrentCluster, useNotifications } from "../../providers";
import { ItemList } from "../common";
import { getTopicNamesList } from "../../tauri";

type TopicListProps = {
  onTopicSelected: (topicName: string) => void;
};

export const TopicList = (props: TopicListProps) => {
  const { onTopicSelected } = props;
  const { success } = useNotifications();
  const [state, setState] = useState<{ topics: string[]; search?: string; loading: boolean }>({
    topics: [],
    loading: true,
  });
  const activeCluster = useCurrentCluster();
  const updateTopicList = () => {
    if (activeCluster) {
      setState({ ...state, loading: true });
      getTopicNamesList(activeCluster)
        .then((topics) => setState({ topics, loading: false }))
        .then((_) => success("List of topics successfully retrieved"))
        .catch(() => {
          setState({ topics: [], loading: false });
        });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateTopicList(), [activeCluster]);

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
