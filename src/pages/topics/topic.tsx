import { ActionIcon, Badge, Button, Center, Container, Divider, Group, Loader, Tooltip } from "@mantine/core";
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
    console.log(typeof topicInfo.configurations);
    return {
      partitionCount: topicInfo.partitions.length,
      estimatedRecord: 100, //todo
      cleanupPolicy: topicInfo.configurations["cleanup.policy"] ?? "...",
    };
  });
  const toggleConsumerRunning = async () => {
    if (!data) return;
    data.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };

  // gradient from green to red
  const getColor = (value: number) => {
    const MAX = 10000;
    if (value > MAX) {
      value = MAX;
    }
    const hue = ((1 - value / MAX) * 130).toString(10);
    return ["hsl(", hue, ",100%,50%)"].join("");
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
          <Button
            mb={10}
            size="xs"
            onClick={toggleConsumerRunning}
            rightIcon={
              <Badge variant="filled" sx={{ backgroundColor: getColor(data.recordCount) }}>
                {data.recordCount}
              </Badge>
            }>
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
