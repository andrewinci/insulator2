import { Button, Text, Container, Divider, Paper, Stack, Title, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { useAppState } from "../../providers";

export const ClusterList = () => {
  const { state } = useAppState();
  return (
    <Container>
      <Group position={"apart"}>
        <Title>Clusters</Title>
        <Button mt={10} component={Link} to="new">
          Add Cluster
        </Button>
      </Group>
      <Divider mt={10} />
      <Stack mt={10}>
        {state.clusters.map((c) => (
          <Paper key={c.name} shadow="md" p="md" withBorder>
            <Group position="apart">
              <Stack>
                <Title>{c.name}</Title>
                <Text>{c.endpoint}</Text>
              </Stack>
              <Button.Group>
                <Button color={"red"}>Delete</Button>
                <Button component={Link} to={`edit/${c.name}`} color={"teal"}>
                  Edit
                </Button>
                <Button>Use</Button>
              </Button.Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};
