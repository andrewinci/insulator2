import { Button, Container, Divider, Stack, Title, Group } from "@mantine/core";
import { Link } from "react-router-dom";

export const TopicList = () => {
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
