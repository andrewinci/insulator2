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
  Menu,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconAdjustmentsHorizontal, IconPlus, IconRocket, IconTool, IconTrash } from "@tabler/icons";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, SearchInput } from "../../components";
import { Cluster } from "../../models";
import { useUserSettings } from "../../providers";
import { AddNewCluster } from "./add-new-cluster";
import { EditCluster } from "./edit-cluster";
import { containsAllWords } from "./helpers";

export const ClusterListPage = () => {
  const { userSettings, setUserSettings } = useUserSettings();
  const navigate = useNavigate();
  const openDeleteModal = (cluster: Cluster) =>
    openConfirmModal({
      title: `Are you sure to delete "${cluster.name}"`,
      children: <Text size="sm">If confirmed, it will not be possible to retrieve this configuration.</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => setUserSettings((s) => ({ ...s, clusters: s.clusters.filter((c) => c.id != cluster.id) })),
    });
  return (
    <ClusterList
      clusters={userSettings.clusters}
      onClusterSelected={(c) => navigate(`/cluster/${c.id}/topics`)}
      onClusterDelete={(c) => openDeleteModal(c)}
    />
  );
};

type ClusterListProps = {
  clusters: Cluster[];
  onClusterSelected: (cluster: Cluster) => void;
  onClusterDelete: (cluster: Cluster) => void;
};

export const ClusterList = ({ clusters, onClusterSelected, onClusterDelete }: ClusterListProps) => {
  const [state, setState] = useState({
    search: "",
    newClusterModalOpened: false,
    editClusterId: null as string | null,
  });

  const filteredClusters = clusters.filter((c) => containsAllWords(c.name, state.search));
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Container fluid>
        <PageHeader title="Clusters" subtitle={`Total: ${clusters.length}`}>
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
        <ScrollArea px={20} style={{ height: "calc(100vh - 100px)" }}>
          <Stack mt={10}>
            {filteredClusters
              .sort((c1, c2) => c1.name.localeCompare(c2.name))
              .map((c, i) => (
                <Paper key={c.name} shadow="md" p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Title order={3}>{c.name}</Title>
                      <Text size={13}>{c.endpoint}</Text>
                    </div>
                    <Group spacing={1} position="right">
                      <Menu position="bottom-start" trigger="hover" openDelay={100} closeDelay={400}>
                        <Menu.Target>
                          <ActionIcon size={28} sx={{ marginRight: "10px" }}>
                            <IconTool />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            color="orange"
                            icon={<IconAdjustmentsHorizontal size={14} />}
                            onClick={() => setState((s) => ({ ...s, editClusterId: c.id }))}>
                            Edit cluster
                          </Menu.Item>
                          <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => onClusterDelete(c)}>
                            Delete cluster
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                      <Button ref={i == 0 ? ref : null} onClick={() => onClusterSelected(c)}>
                        Use <IconRocket />
                      </Button>
                    </Group>
                  </Group>
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
