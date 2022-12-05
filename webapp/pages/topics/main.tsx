import { useSessionStorage } from "@mantine/hooks";
import { Allotment } from "allotment";
import { useParams } from "react-router-dom";

import { Topic } from "./topic/main";
import { TopicList } from "./topic-list";

export const TopicsPage = () => {
  const { clusterId, topicName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `topic-main-${clusterId}`,
    defaultValue: {
      topicName,
    },
  });

  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }

  return (
    <Allotment>
      <Allotment.Pane minSize={430} maxSize={state.topicName ? 600 : undefined}>
        <TopicList clusterId={clusterId} onTopicSelected={(activeTopic) => setState({ topicName: activeTopic })} />
      </Allotment.Pane>
      {state.topicName && (
        <Allotment.Pane minSize={520}>
          <Topic clusterId={clusterId} topicName={state.topicName} />
        </Allotment.Pane>
      )}
    </Allotment>
  );
};
