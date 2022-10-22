import { ActionIcon, Button, Center, Container, Divider, Group, Loader, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { RecordsList } from "./record-list";
import { getConsumerState, getRecord, stopConsumer } from "../../tauri/consumer";
import { PageHeader } from "../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";

export const Topic = ({ clusterId, topicName }: { clusterId: string; topicName: string }) => {
  const { data, isLoading } = useQuery(
    ["getConsumerState", clusterId, topicName],
    () => getConsumerState(clusterId, topicName),
    { refetchInterval: 200 }
  );

  const toggleConsumerRunning = async () => {
    if (!data) return;
    data.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        {/* todo: retrieve info from the topic */}
        <PageHeader
          title={topicName}
          subtitle={`Estimated Records: 10000000000, Cleanup policy: Delete, Partitions: ${321}`}
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
