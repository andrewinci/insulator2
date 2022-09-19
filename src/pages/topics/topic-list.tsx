import { Button, Container, Divider, Title, Group, NavLink, Input } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FixedSizeList } from "react-window";
import { getTopicList, TopicInfo } from "../../kafka";
import { useAppState, useNotifications } from "../../providers";

function getWindowSize() {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
}

export const TopicList = () => {
  const { state: appState } = useAppState();
  const { alert, success } = useNotifications();
  const [state, setState] = useState<{ topics: TopicInfo[]; search?: string }>({ topics: [] });
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const filteredTopics = useMemo(
    () => state.topics.filter((t) => t.name.toLowerCase().includes(state.search ?? "")),
    [state.search, state.topics]
  );

  useMemo(() => {
    if (appState.activeCluster) {
      getTopicList(appState.activeCluster)
        .then((topics) => setState({ topics }))
        .then((_) => success("List of topics successfully retrieved"))
        .catch((err) =>
          alert(
            `Unable to retrieve the list of topics for cluster "${appState.activeCluster?.name}"`,
            err
          )
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.activeCluster]);

  return (
    <Container>
      <Group position={"apart"}>
        <Title>Topics</Title>
        <Button component={Link} to="new">
          Add topic
        </Button>
      </Group>
      <Divider mt={10} />
      <Input
        my={10}
        icon={<IconSearch />}
        placeholder="Search"
        value={state.search}
        onChange={(v: any) => {
          if (v) setState({ ...state, search: v.target.value.toLowerCase() });
        }}
      />
      <FixedSizeList
        height={windowSize.innerHeight - 150}
        itemCount={filteredTopics.length}
        itemSize={38}
        width={"100%"}>
        {({ index, style }) => <NavLink style={style} label={filteredTopics[index].name} />}
      </FixedSizeList>
      {/* <ScrollArea mt={10} type="hover" style={{ height: "calc(100vh - 150px)" }}>
        {Array(1000).fill(0)
          .map((_, i) => ({ name: `random topic name ${i}` }))
          .filter((t) => t.name.includes(state.search ?? ""))
          .map((topic) =>
            <NavLink key={topic.name} label={topic.name} />
          )}
      </ScrollArea> */}
    </Container>
  );
};
