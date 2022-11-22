import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Text,
  Menu,
  Anchor,
  Divider,
  Tooltip,
} from "@mantine/core";
import { IconArrowBarToDown, IconArrowBarToUp, IconInfoCircle, IconSearch, IconTool, IconTrash } from "@tabler/icons";
import { RecordsList } from "./record-list";
import { getConsumerState, stopConsumer } from "../../tauri/consumer";
import { CodeEditor, PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";
import { deleteTopic, getLastOffsets, getTopicInfo } from "../../tauri/admin";
import { useState } from "react";
import { Allotment } from "allotment";
import { useNavigate } from "react-router-dom";
import { openConfirmModal } from "@mantine/modals";
import { useNotifications } from "../../providers";

export const Topic = ({ clusterId, topicName }: { clusterId: string; topicName: string }) => {
  const { data, isLoading } = useQuery(
    ["getConsumerState", clusterId, topicName],
    () => getConsumerState(clusterId, topicName),
    { refetchInterval: 500 }
  );

  const { data: estimatedRecord } = useQuery(["getLastOffsets", clusterId, topicName], () =>
    getLastOffsets(clusterId, [topicName])
      .then((res) => res[topicName].map((po) => po.offset))
      .then((offsets) => offsets.reduce((a, b) => a + b, 0))
  );
  const { data: topicInfo } = useQuery(["getTopicInfo", clusterId, topicName], async () => {
    const topicInfo = await getTopicInfo(clusterId, topicName);
    return {
      partitionCount: topicInfo.partitions.length,
      cleanupPolicy: topicInfo.configurations["cleanup.policy"] ?? "...",
    };
  });

  const toggleConsumerRunning = async () => {
    if (!data) return;
    data.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };

  const defaultQuery =
    "SELECT partition, offset, timestamp, key, payload\nFROM {:topic}\nORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
  const [query, setQuery] = useState<string>();
  const [modalState, setModalState] = useState<{ opened: boolean; query: string }>({
    opened: false,
    query: defaultQuery,
  });

  return (
    <>
      <Allotment vertical>
        <Allotment.Pane minSize={300}>
          <Container style={{ maxWidth: "100%" }}>
            <PageHeader
              title={topicName}
              subtitle={`Estimated Records: ${estimatedRecord ?? "..."}, Cleanup policy: ${
                topicInfo?.cleanupPolicy ?? "..."
              }, Partitions: ${topicInfo?.partitionCount ?? "..."}`}>
              <Tools clusterId={clusterId} topic={topicName} />
            </PageHeader>
            {isLoading && (
              <Center mt={10}>
                <Loader />
              </Center>
            )}
            {!isLoading && data && (
              <>
                <Text my={5} size={"xs"}>
                  Note: use json syntax to filter by field in the payload{" "}
                  <Anchor href="https://www.sqlite.org/json1.html" target="tauri">
                    https://www.sqlite.org/json1.html
                  </Anchor>
                </Text>
                <CodeEditor
                  height={80}
                  language="sql"
                  value={modalState.query}
                  onChange={(v) => setModalState({ ...modalState, query: v ?? "" })}
                />
                <Group mt={5} position="apart">
                  <Group>
                    <Button
                      size="xs"
                      onClick={toggleConsumerRunning}
                      rightIcon={
                        <Tooltip label="Total records consumed internally and queryable">
                          <Badge variant="filled" color={"red"}>
                            {data.recordCount}
                          </Badge>
                        </Tooltip>
                      }>
                      {data.isRunning ? "Stop" : "Consume"}
                    </Button>

                    <Button leftIcon={<IconSearch size={14} />} size="xs" onClick={() => setQuery(modalState.query)}>
                      Query
                    </Button>
                    <Button
                      leftIcon={<IconArrowBarToDown size={14} />}
                      disabled
                      size="xs"
                      onClick={() => setQuery(modalState.query)}>
                      Export
                    </Button>
                  </Group>
                  <Button
                    leftIcon={<IconArrowBarToUp size={14} />}
                    disabled
                    color={"orange"}
                    size="xs"
                    onClick={() => setQuery(modalState.query)}>
                    Produce
                  </Button>
                </Group>

                <Divider my={10} />

                <RecordsList clusterId={clusterId} topic={topicName} heightOffset={140} query={query} />
              </>
            )}
          </Container>
        </Allotment.Pane>
      </Allotment>
    </>
  );
};

const Tools = ({ clusterId, topic }: { clusterId: string; topic: string }) => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const openDeleteTopicModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this topic?",
      children: (
        <>
          <Text color="red" size="sm">
            The topic {topic} will be deleted. This action is not reversible!
          </Text>
          <Text size="sm">Note: this operation may fail if the ACLs do not allow the deletion.</Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () =>
        await deleteTopic(clusterId, topic).then((_) => {
          success(`Topic ${topic} deleted successfully`);
          navigate(`/cluster/${clusterId}/topics`);
        }),
    });

  const openInfoModal = () => console.log("Not implemented yet");

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          <IconTool />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item icon={<IconInfoCircle size={14} />} onClick={openInfoModal}>
          Topic info
        </Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteTopicModal}>
          Delete topic
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
