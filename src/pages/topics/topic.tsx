import { ActionIcon, Button, Center, Container, Divider, Group, Loader, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { RecordsList } from "./record-list";
import { getConsumerState, getRecord, stopConsumer } from "../../tauri/consumer";
import { PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";
import { getTopicInfo } from "../../tauri/admin";

export const Topic = ({ clusterId, topicName }: { clusterId: string; topicName: string }) => {
  const { data, isLoading } = useQuery(
    ["getConsumerState", clusterId, topicName],
    () => getConsumerState(clusterId, topicName),
    { refetchInterval: 200 }
  );

  const { data: topicInfo } = useQuery(["getTopicInfo", clusterId, topicName], async () => {
    const topicInfo = await getTopicInfo(clusterId, topicName);
    return {
      partitionCount: topicInfo.partitions.length,
      estimatedRecord: 100, //todo
      cleanupPolicy: "Delete Compact",
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
          subtitle={`Estimated Records: ${topicInfo?.estimatedRecord ?? "..."}, Cleanup policy: ${
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
          <Button mb={10} size="xs" onClick={toggleConsumerRunning}>
            {data.isRunning ? "Stop" : "Consume"}
          </Button>
          <RecordsList
            heightOffset={140}
            itemCount={data.recordCount}
            fetchRecord={(index) => getRecord(index, clusterId, topicName)}
          />
        </>
      )}
    </Container>
  );
};
