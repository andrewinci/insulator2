import { useMemo, useState } from "react";
import { useCurrentCluster, useNotifications } from "../../providers";
import { ItemList } from "../common";
import { invoke } from "@tauri-apps/api";
import { Cluster, TopicInfo } from "../../models/kafka";
import { format, TauriError } from "../../tauri";

function getTopicNamesList(cluster: Cluster): Promise<string[]> {
  return invoke<TopicInfo[]>("list_topics", { cluster }).then((topics) => topics.map((t) => t.name));
}

type TopicListProps = {
  onTopicSelected: (topicName: string) => void;
};

export const TopicList = (props: TopicListProps) => {
  const { onTopicSelected } = props;
  const { alert, success } = useNotifications();
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
        .catch((err: TauriError) => {
          alert(`Unable to retrieve the list of topics for "${activeCluster?.name}"`, format(err));
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
