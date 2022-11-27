import { Center, Container, Loader } from "@mantine/core";
import { RecordsList, RecordsListRef } from "./record-list";
import { getConsumerState, stopConsumer } from "../../../tauri/consumer";
import { PageHeader } from "../../../components";
import { openConsumerModal } from "./consumer-modal";
import { useQuery } from "@tanstack/react-query";
import { getLastOffsets, getTopicInfo } from "../../../tauri/admin";
import { Allotment } from "allotment";
import { Tools } from "./tools";
import { TopicPageMenu } from "./topic-menu";
import { useRef, useState } from "react";
import { useCache } from "../../../hooks";
import { ExportRecordsModal } from "./export-records";

export const Topic = ({ clusterId, topicName }: { clusterId: string; topicName: string }) => {
  const { data: consumerState, isLoading } = useQuery(
    ["getConsumerState", clusterId, topicName],
    () => getConsumerState(clusterId, topicName),
    { refetchInterval: 1000 }
  );

  const { data: estimatedRecord } = useQuery(["getLastOffsets", clusterId, topicName], () =>
    getLastOffsets(clusterId, [topicName])
      .then((res) => res[topicName].map((po) => po.offset))
      .then((offsets) => offsets.reduce((a, b) => a + b, 0))
  );
  // get topic information to populate the page header
  const { data: topicInfo } = useQuery(["getTopicInfo", clusterId, topicName], async () => {
    const topicInfo = await getTopicInfo(clusterId, topicName);
    return {
      partitionCount: topicInfo.partitions.length,
      cleanupPolicy: topicInfo.configurations["cleanup.policy"] ?? "...",
    };
  });

  // cached query across navigation
  const defaultQuery =
    "SELECT partition, offset, timestamp, key, payload\nFROM {:topic}\nORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}\n";
  const [queryState, setQueryState] = useCache(
    {
      key: `topic-page-${clusterId}-${topicName}`,
      initialValue: { query: defaultQuery },
    },
    [clusterId, topicName]
  );

  const [paneHeights, setPaneHeights] = useState({
    headerHeight: 10,
    recordsHeight: 10,
  });

  // enable/disable consumer
  const toggleConsumerRunning = async () => {
    if (!consumerState) return;
    consumerState.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };

  // reference to trigger the query
  const recordListRef = useRef<RecordsListRef>(null);

  // export records modal
  const [exportModal, setExportModal] = useState({ opened: false });

  return (
    <>
      <Allotment
        vertical
        onChange={([s1, s2]) => setPaneHeights((s) => ({ ...s, headerHeight: s1, recordsHeight: s2 }))}>
        <Allotment.Pane preferredSize={230} minSize={230}>
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
            {!isLoading && consumerState && (
              <TopicPageMenu
                height={paneHeights.headerHeight - 150}
                onConsumerToggle={toggleConsumerRunning}
                consumedRecords={consumerState.recordCount}
                isConsumerRunning={consumerState.isRunning}
                query={queryState.query}
                onQueryChange={(query) => setQueryState((s) => ({ ...s, query }))}
                onQuery={() => recordListRef.current?.executeQuery(queryState.query)}
                onExportClick={() => setExportModal({ opened: true })}
              />
            )}
          </Container>
        </Allotment.Pane>
        <Allotment.Pane minSize={400}>
          <Container mt={10} style={{ maxWidth: "100%" }}>
            <RecordsList
              ref={recordListRef}
              clusterId={clusterId}
              topic={topicName}
              height={paneHeights.recordsHeight - 20}
            />
          </Container>
        </Allotment.Pane>
      </Allotment>
      <ExportRecordsModal
        clusterId={clusterId}
        topicName={topicName}
        query={queryState.query}
        opened={exportModal.opened}
        onClose={() => setExportModal({ opened: false })}
      />
    </>
  );
};
