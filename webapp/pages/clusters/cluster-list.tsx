import {
  Button,
  Text,
  Container,
  Paper,
  Stack,
  Title,
  Group,
  ScrollArea,
  Tooltip,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconPlus } from "@tabler/icons";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SearchInput } from "../../components";
import { Cluster } from "../../models";
import { useUserSettings } from "../../providers";
import { AddNewCluster, EditCluster } from "./edit-clusters";

export const ClusterList = () => {
  const { userSettings, setUserSettings } = useUserSettings();
  const [state, setState] = useState<{ search: string; newClusterModalOpened: boolean; editClusterId: string | null }>({
    search: "",
    newClusterModalOpened: false,
    editClusterId: null,
  });
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
    <>
      <Container>
        <PageHeader title="Clusters" subtitle={`Total: ${userSettings.clusters.length}`}>
          <SearchInput
            showShortcut={true}
            value={state.search}
            onChange={(v) => setState({ ...state, search: v })}
            onEnter={() => ref.current?.focus()}
          />
          <Tooltip label="Add a new cluster">
            <ActionIcon size="sm" onClick={() => setState((s) => ({ ...s, newClusterModalOpened: true }))}>
              <IconPlus></IconPlus>
            </ActionIcon>
          </Tooltip>
        </PageHeader>
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
                      <Button onClick={() => setState((s) => ({ ...s, editClusterId: c.id }))} color={"teal"}>
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
      {/* New cluster modal */}
      <Modal
        size={"xl"}
        opened={state.newClusterModalOpened}
        onClose={() => {
          setState((s) => ({ ...s, newClusterModalOpened: false }));
        }}
        closeOnEscape={false}
        closeOnClickOutside={false}
        title={<Title order={3}>Add new cluster</Title>}>
        <AddNewCluster onSubmit={() => setState((s) => ({ ...s, newClusterModalOpened: false }))} />
      </Modal>
      {/* Edit cluster modal */}
      {state.editClusterId && (
        <Modal
          size={"xl"}
          opened={state.editClusterId != null}
          onClose={() => {
            setState((s) => ({ ...s, editClusterId: null }));
          }}
          closeOnEscape={false}
          closeOnClickOutside={false}
          title={<Title order={3}>Edit cluster</Title>}>
          <EditCluster
            clusterId={state.editClusterId}
            onSubmit={() => setState((s) => ({ ...s, editClusterId: null }))}
          />
        </Modal>
      )}
    </>
  );
};
