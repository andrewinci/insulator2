import {
  Container,
  Divider,
  Title,
  Group,
  NavLink,
  Input,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Text,
} from "@mantine/core";
import { IconPlus, IconRefresh, IconSearch } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import { getTopicList, TopicInfo } from "../../kafka";
import { useAppState, notifyAlert, notifySuccess } from "../../providers";

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

export const TopicList = ({ onTopicSelected }: { onTopicSelected: (topic: TopicInfo) => void }) => {
  const { appState } = useAppState();
  const [state, setState] = useState<{ topics: TopicInfo[]; search?: string; loading: boolean }>({
    topics: [],
    loading: true,
  });
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const filteredTopics = useMemo(
    () => state.topics.filter((t) => t.name.toLowerCase().includes(state.search ?? "")).sort(),
    [state.search, state.topics]
  );

  const updateTopicList = () => {
    if (appState.activeCluster) {
      setState({ ...state, loading: true });
      getTopicList(appState.activeCluster)
        .then((topics) => setState({ topics, loading: false }))
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
    <Container style={{ width: "100%" }}>
      <Group position={"apart"}>
        <Title>Topics</Title>
        <Group>
          <Tooltip label="Create a new topic">
            <ActionIcon disabled={true}>
              <IconPlus></IconPlus>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Refresh list">
            <ActionIcon onClick={updateTopicList}>
              <IconRefresh></IconRefresh>
            </ActionIcon>
          </Tooltip>
        </Group>
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
      {/* todo: fix the below mess */}
      {state.loading ? (
        <Center mt={10}>
          <Loader />
        </Center>
      ) : filteredTopics.length > 0 ? (
        <FixedSizeList
          height={windowSize.innerHeight - 150}
          itemCount={filteredTopics.length}
          itemSize={38}
          width={"100%"}>
          {({ index, style }) => (
            <NavLink
              onClick={() => onTopicSelected(filteredTopics[index])}
              style={style}
              label={filteredTopics[index].name}
            />
          )}
        </FixedSizeList>
      ) : (
        <Center mt={20}>
          <Text>Empty list</Text>
        </Center>
      )}
    </Container>
  );
};
