import { useSessionStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { Topic } from "./topic/main";
import { TopicList } from "./topic-list";
import { TwoColumnPage } from "../common";

export const TopicsPage = () => {
  const { clusterId, topicName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `topic-main-${clusterId}`,
    defaultValue: { topicName },
  });

  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }

  return (
    <TwoColumnPage
      title="Topics"
      left={
        <TopicList
          clusterId={clusterId}
          onTopicSelected={(activeTopic) => setState((s) => ({ ...s, topicName: activeTopic }))}
        />
      }
      right={state.topicName && <Topic clusterId={clusterId} topicName={state.topicName} />}
    />
  );
};
