import {
  Button,
  Text,
  Container,
  Divider,
  Paper,
  Stack,
  Title,
  Group,
  ScrollArea,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Link, useNavigate } from "react-router-dom";
import { Cluster } from "../../models/kafka";
import { useAppState } from "../../providers";

export const ClusterList = () => {
  const { appState, setAppState } = useAppState();
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
      },
    });

  return (
    <Container>
      <Group position={"apart"}>
        <Title>Clusters</Title>
        <Button component={Link} to="/cluster/new">
          Add Cluster
        </Button>
      </Group>
      <Divider mt={10} />
      <ScrollArea px={15} style={{ height: "calc(100vh - 100px)" }}>
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
                    <Button component={Link} to={`/cluster/edit/${c.id}`} color={"teal"}>
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        navigate(`/cluster/${c.id}/topics`);
                      }}>
                      Use
                    </Button>
                  </Button.Group>
                </Group>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Container>
  );
};
