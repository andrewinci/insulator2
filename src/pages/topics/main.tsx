import { Group } from "@mantine/core";
import { useState } from "react";
import { Topic } from "./topic";
import { TopicList } from "./topic-list";

export const TopicsPage = () => {
  const [state, setState] = useState<{ activeTopic?: string }>({});
  const { activeTopic } = state;
  return (
    <Group grow={true} align={"stretch"} position={"center"} noWrap={true}>
      <TopicList
        width={activeTopic ? 400 : undefined}
        onTopicSelected={(activeTopic) => {
          setState({ ...state, activeTopic });
        }}
      />
      {activeTopic && <Topic topicName={activeTopic} />}
    </Group>
  );
};
