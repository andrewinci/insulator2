import { useSessionStorage } from "@mantine/hooks";
import { Allotment } from "allotment";
import { useParams } from "react-router-dom";
import { Topic } from "./topic/main";
import { TopicList } from "./topic-list";
import { MinimizeButton } from "../../components";
import { Title } from "@mantine/core";

export const TopicsPage = () => {
  const { clusterId, topicName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `topic-main-${clusterId}`,
    defaultValue: {
      topicName,
      minimized: false,
    },
  });

  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }
  const minimizedSize = 40;
  return (
    <Allotment>
      <Allotment.Pane
        minSize={state.minimized ? minimizedSize : 430}
        preferredSize={state.topicName ? 600 : undefined}
        maxSize={state.minimized ? minimizedSize : 1000}>
        {state.minimized && (
          <Title style={{ marginTop: 20, transform: "rotate(90deg)" }} size={19}>
            Topics
          </Title>
        )}
        {!state.minimized && (
          <TopicList
            clusterId={clusterId}
            onTopicSelected={(activeTopic) => setState((s) => ({ ...s, topicName: activeTopic }))}
          />
        )}
        {state.topicName && (
          <MinimizeButton
            minimizeTarget="itemList"
            minimized={state.minimized}
            onClick={() => setState((s) => ({ ...s, minimized: !state.minimized }))}
          />
        )}
      </Allotment.Pane>
      <Allotment.Pane minSize={520}>
        {state.topicName && <Topic clusterId={clusterId} topicName={state.topicName} />}
      </Allotment.Pane>
    </Allotment>
  );
};
