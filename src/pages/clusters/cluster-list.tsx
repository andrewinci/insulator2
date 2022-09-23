import { Button, Text, Container, Divider, Paper, Stack, Title, Group } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Link, useNavigate } from "react-router-dom";
import { Cluster } from "../../kafka";
import { useAppState } from "../../providers";

export const ClusterList = () => {
  const { appState, setAppState, setActiveCluster } = useAppState();
  const navigate = useNavigate();

  const openModal = (cluster: Cluster) =>
    openConfirmModal({
      title: `Are you sure to delete "${cluster.name}"`,
      children: (
        <Text size="sm">If confirmed, it will not be possible to retrieve this configuration.</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        setAppState({ ...appState, clusters: appState.clusters.filter((c) => c.id != cluster.id) });
        if (appState.activeCluster?.id == cluster.id) {
          appState.activeCluster = undefined;
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
        {appState.clusters.map((c) => (
          <Paper key={c.name} shadow="md" p="md" withBorder>
            <Stack>
              <Title order={3}>{c.name}</Title>
              <Text size={13}>{c.endpoint}</Text>
              <Group position="right">
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
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
};
