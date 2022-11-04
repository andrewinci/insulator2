import { Button, Text, Container, Divider, Paper, Stack, Title, Group, ScrollArea } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader, SearchInput } from "../../components";
import { Cluster } from "../../models";
import { useUserSettings } from "../../providers";

export const ClusterList = () => {
  const { userSettings, setUserSettings } = useUserSettings();
  const [state, setState] = useState<{ search: string }>({ search: "" });
  const navigate = useNavigate();

  const openModal = (cluster: Cluster) =>
    openConfirmModal({
      title: `Are you sure to delete "${cluster.name}"`,
      children: <Text size="sm">If confirmed, it will not be possible to retrieve this configuration.</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => setUserSettings((s) => ({ ...s, clusters: s.clusters.filter((c) => c.id != cluster.id) })),
    });

  const filteredClusters = useMemo(
    () => userSettings.clusters.filter((c) => c.name.toLowerCase().includes(state.search ?? "")),
    [state.search, userSettings.clusters]
  );

  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Container>
      <Group position={"apart"}>
        <PageHeader title="Clusters" subtitle={`Total: ${userSettings.clusters.length}`} />
        <SearchInput
          showShortcut={true}
          value={state.search}
          onChange={(v) => setState({ ...state, search: v })}
          onEnter={() => ref.current?.focus()}
        />
        <Button component={Link} to="/cluster/new">
          Add Cluster
        </Button>
      </Group>
      <Divider mt={10} />
      <ScrollArea px={15} style={{ height: "calc(100vh - 100px)" }}>
        <Stack mt={10}>
          {filteredClusters.map((c, i) => (
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
                      ref={i == 0 ? ref : null}
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
