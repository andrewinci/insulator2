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

  const [paneHeight, setPaneHeight] = useState({ headerHeight: 10, recordsHeight: 10 });

  const toggleConsumerRunning = async () => {
    if (!data) return;
    data.isRunning ? await stopConsumer(clusterId, topicName) : openConsumerModal({ clusterId, topicName });
  };

  const ref = useRef<RecordsListRef>(null);

  return (
    <Allotment vertical onChange={([s1, s2]) => setPaneHeight({ headerHeight: s1, recordsHeight: s2 })}>
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
          {!isLoading && data && (
            <TopicPageMenu
              height={paneHeight.headerHeight - 150}
              onConsumerToggle={toggleConsumerRunning}
              consumedRecords={data.recordCount}
              isConsumerRunning={data.isRunning}
              onQuery={(query: string) => ref.current?.executeQuery(query)}
            />
          )}
        </Container>
      </Allotment.Pane>
      <Allotment.Pane minSize={400}>
        <Container mt={10} style={{ maxWidth: "100%" }}>
          <RecordsList ref={ref} clusterId={clusterId} topic={topicName} height={paneHeight.recordsHeight - 20} />
        </Container>
      </Allotment.Pane>
    </Allotment>
  );
};
