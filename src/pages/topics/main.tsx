import { Allotment } from "allotment";
import { useState } from "react";
import { Topic } from "./topic";
import { TopicList } from "./topic-list";

export const TopicsPage = () => {
  const [state, setState] = useState<{ activeTopic?: string }>({});
  const { activeTopic } = state;
  return (
    <Allotment>
      <Allotment.Pane minSize={300} maxSize={activeTopic ? 500 : undefined}>
        <TopicList
          onTopicSelected={(activeTopic) => {
            setState({ ...state, activeTopic });
          }}
        />
      </Allotment.Pane>
      {activeTopic && (
        <Allotment.Pane minSize={300}>
          <Topic topicName={activeTopic} />
        </Allotment.Pane>
      )}
    </Allotment>
  );
};
