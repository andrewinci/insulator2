import { ActionIcon, Badge, Button, Center, Container, Group, Loader, Tooltip, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { RecordsList } from "./record-list";
import { getConsumerState, stopConsumer } from "../../tauri/consumer";
import { PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";
import { getLastOffsets, getTopicInfo } from "../../tauri/admin";
import { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Allotment } from "allotment";

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
              <Tooltip position="bottom" label="Topic info">
                <ActionIcon>
                  <IconInfoCircle />
                </ActionIcon>
              </Tooltip>
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
                value={modalState.query}
                onChange={(e) => setModalState({ ...modalState, query: e.currentTarget.value })}
                language="sql"
                minHeight={80}
                style={{
                  fontSize: 12,
                  backgroundColor: "#000000",
                  fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
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
