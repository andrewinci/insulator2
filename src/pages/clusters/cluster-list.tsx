import { Button, Text, Container, Divider, Paper, Stack, Title, Group } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Link, useNavigate } from "react-router-dom";
import { Cluster } from "../../kafka";
import { useAppState } from "../../providers";

export const ClusterList = () => {
  const { state, setState, setActiveCluster } = useAppState();
  const navigate = useNavigate();

  const openModal = (cluster: Cluster) =>
    openConfirmModal({
      title: `Are you sure to delete "${cluster.name}"`,
      children: (
        <Text size="sm">If confirmed, it will not be possible to retrieve this configuration.</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        setState({ ...state, clusters: state.clusters.filter((c) => c.id != cluster.id) });
        if (state.activeCluster?.id == cluster.id) {
          state.activeCluster = undefined;
        }
      },
    });

  return (
    <Container>
      <Group position={"apart"}>
        <Title>Clusters</Title>
        <Button component={Link} to="new">
          Add Cluster
        </Button>
      </Group>
      <Divider mt={10} />
      <Stack mt={10}>
        {state.clusters.map((c) => (
          <Paper key={c.name} shadow="md" p="md" withBorder>
            <Group position="apart">
              <Stack>
                <Title order={3}>{c.name}</Title>
                <Text>{c.endpoint}</Text>
              </Stack>
              <Button.Group>
                <Button onClick={() => openModal(c)} color={"red"}>
                  Delete
                </Button>
                <Button component={Link} to={`edit/${c.id}`} color={"teal"}>
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setActiveCluster(c);
                    navigate("/topics");
                  }}>
                  Use
                </Button>
              </Button.Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};
