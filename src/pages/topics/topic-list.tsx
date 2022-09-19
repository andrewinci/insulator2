import { Button, Container, Divider, Stack, Title, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { getTopicList } from "../../kafka";
import { useAppState } from "../../providers";

export const TopicList = () => {
  const { state } = useAppState();
  if (state.activeCluster) {
    getTopicList(state.activeCluster);
  }
  return (
    <Container>
      <Group position={"apart"}>
        <Title>Topics</Title>
        <Button mt={10} component={Link} to="new">
          Add topic
        </Button>
      </Group>
      <Divider mt={10} />
      <Stack mt={10}></Stack>
    </Container>
  );
};
