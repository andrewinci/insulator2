import { ActionIcon, Badge, Button, Center, Container, Group, Loader, Text, Menu } from "@mantine/core";
import { IconInfoCircle, IconTool, IconTrash } from "@tabler/icons";
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
    "SELECT partition, offset, timestamp, key, payload FROM {:topic}\nORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}";
  const [query, setQuery] = useState<string>(defaultQuery);
  const [modalState, setModalState] = useState<{ opened: boolean; query: string }>({ opened: false, query });

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
                <Group>
                  <Button
                    mb={10}
                    size="xs"
                    onClick={toggleConsumerRunning}
                    rightIcon={
                      <Badge variant="filled" color={"red"}>
                        {data.recordCount}
                      </Badge>
                    }>
                    {data.isRunning ? "Stop" : "Consume"}
                  </Button>
                  <Button
                    mb={10}
                    size="xs"
                    onClick={() => setModalState({ ...modalState, opened: !modalState.opened })}>
                    {modalState.opened ? "Hide query" : "Edit query"}
                  </Button>
                </Group>
                <RecordsList clusterId={clusterId} topic={topicName} heightOffset={140} query={query} />
              </>
            )}
          </Container>
        </Allotment.Pane>
        <Allotment.Pane visible={modalState.opened} minSize={200} maxSize={250} preferredSize={200}>
          <div style={{ padding: "10px", display: "flex", flexDirection: "column", flexGrow: 1, height: "100%" }}>
            <Text mb={10} size="sm">
              Query consumed records
            </Text>
            <div
              style={{
                backgroundColor: "#000000",
                borderRadius: "3px",
                height: "100%",
                maxHeight: "135px",
                overflowY: "auto",
              }}>
              <CodeEditor
                height={80}
                language="sql"
                value={modalState.query}
                onChange={(v) => setModalState({ ...modalState, query: v ?? "" })}
              />
            </div>
            <Text size={"sm"}>
              Note: use json syntax to filter by fields in the payload https://www.sqlite.org/json1.html
            </Text>
            <Button
              style={{ width: "80px" }}
              mt={10}
              size="xs"
              disabled={modalState.query.length < 64 || modalState.query == query} //this is the len of the minimal statement (select ... from ...)
              onClick={() => setQuery(modalState.query)}>
              Apply
            </Button>
          </div>
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
