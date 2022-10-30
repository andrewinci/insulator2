import { ActionIcon, Badge, Button, Center, Container, Divider, Group, Loader, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { RecordsList } from "./record-list";
import { getConsumerState, stopConsumer } from "../../tauri/consumer";
import { PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";
import { getLastOffsets, getTopicInfo } from "../../tauri/admin";

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

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <PageHeader
          title={topicName}
          subtitle={`Estimated Records: ${estimatedRecord ?? "..."}, Cleanup policy: ${
            topicInfo?.cleanupPolicy ?? "..."
          }, Partitions: ${topicInfo?.partitionCount ?? "..."}`}
        />
        <Tooltip position="bottom" label="Topic info">
          <ActionIcon>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider my={10} />
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}
      {!isLoading && data && (
        <>
          <Group position="apart">
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
            {/* <SearchInput/> */}
          </Group>
          <RecordsList clusterId={clusterId} topic={topicName} heightOffset={140} />
        </>
      )}
    </Container>
  );
};
