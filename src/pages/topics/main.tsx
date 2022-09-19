import { Group } from "@mantine/core";
import { useState } from "react";
import { TopicInfo } from "../../kafka";
import { Topic } from "./topic";
import { TopicList } from "./topic-list";

export const TopicsPage = () => {
  const [state, setState] = useState<{ active?: TopicInfo }>({});

  return (
    <Group grow={true} align={"stretch"} position={"center"} noWrap={true}>
      <TopicList
        onTopicSelected={(topic) => {
          setState({ ...state, active: topic });
        }}
      />
      {state.active && <Topic topic={state.active} />}
    </Group>
  );
};
