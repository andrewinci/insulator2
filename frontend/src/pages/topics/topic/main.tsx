import { Center, Container, Group, Loader } from "@mantine/core";
import { RecordsList, RecordsListRef } from "./record-list";
import { getConsumerState, startConsumer, stopConsumer } from "../../../tauri/consumer";
import { NewWindowButton, PageHeader } from "../../../components";
import { useQuery } from "@tanstack/react-query";
import { Allotment } from "allotment";
import { ToolsMenu } from "./tools-menu";
import { TopicPageMenu } from "./topic-page-menu";
import { useMemo, useRef, useState } from "react";
import { useCache } from "../../../hooks";
import { ExportRecordsModal } from "../modals/export-records-modal";
import { ConsumerConfigurationModal } from "../modals/consumer-configuration-modal";
import { ConsumerConfiguration } from "../../../models";
import { parseNumberToHumanReadable } from "../../../helpers/human-readable";
import { css } from "@emotion/css";
import { useAdmin } from "../../../tauri/admin";

type TopicProps = {
  clusterId: string;
  topicName: string;
  onTopicDeleted: (topicName: string) => void;
};

export const Topic = (props: TopicProps & JSX.IntrinsicAttributes) => {
  const { clusterId, topicName, onTopicDeleted } = props;
  // cached query across navigation
  const [queryState, setQueryState] = useCache(
    {
      key: `topic-page-${clusterId}-${topicName}`,
      initialValue: {
        query: `SELECT * FROM {:topic}
-- query by json fields with the json_extract function
-- WHERE json_extract(payload, "$.fieldName") = "something"
ORDER BY timestamp desc LIMIT {:limit} OFFSET {:offset}
          `,
      },
    },
    [clusterId, topicName]
  );

  // topic info to populate the topic menu
  const { estimatedRecords, topicInfo } = useTopicInfo(clusterId, topicName);

  // allotment state
  const [paneHeights, setPaneHeights] = useState({ headerHeight: 10, recordsHeight: 10 });

  // consumer
  const {
    isLoading,
    isRunning,
    consumedRecordsCount,
    consumerModalOpened,
    onConsumerModalClose,
    onStartConsumer,
    configureConsumer,
    onStopConsumer,
  } = useConsumer(clusterId, topicName);

  // reference to trigger the query
  const recordListRef = useRef<RecordsListRef>(null);

  // export records modal
  const [exportState, setExportState] = useState({ modalOpened: false, exportInProgress: false });
  const [canResizeTopAllotment, setCanResizeTopAllotment] = useState(false);

  return (
    <>
      <Allotment
        vertical
        onChange={([s1, s2]) => setPaneHeights((s) => ({ ...s, headerHeight: s1, recordsHeight: s2 }))}>
        <Allotment.Pane
          className={css({ overflow: "visible !important" })}
          preferredSize={230}
          minSize={canResizeTopAllotment ? 245 : 195}
          maxSize={canResizeTopAllotment ? 1000 : 195}>
          <Container style={{ maxWidth: "100%" }}>
            <PageHeader
              title={topicName}
              subtitle={`Records: ~${parseNumberToHumanReadable(estimatedRecords) ?? "..."}, Cleanup: ${
                topicInfo?.cleanupPolicy ?? "..."
              }, Partitions: ${topicInfo?.partitionCount ?? "..."}`}>
              <Group spacing={0}>
                <ToolsMenu
                  clusterId={clusterId}
                  topic={topicName}
                  onExportClick={() => setExportState({ modalOpened: true, exportInProgress: false })}
                  exportInProgress={exportState.exportInProgress}
                  onTopicDeleted={onTopicDeleted}
                />
                <NewWindowButton
                  url={`/modal/cluster/${clusterId}/topic/${topicName}`}
                  windowTitle={`Topic ${topicName}`}
                />
              </Group>
            </PageHeader>
            {isLoading && (
              <Center mt={10}>
                <Loader />
              </Center>
            )}
            {!isLoading && (
              <TopicPageMenu
                clusterId={clusterId}
                topicName={topicName}
                height={paneHeights.headerHeight - 150}
                onModeChange={(m) => setCanResizeTopAllotment(m === "SQL" ? true : false)}
                onConsumerChange={(config) => {
                  if (config == "Custom") configureConsumer();
                  else if (config == "Stop") onStopConsumer();
                  else onStartConsumer(config);
                }}
                consumedRecords={consumedRecordsCount}
                isConsumerRunning={isRunning}
                query={queryState.query}
                onQueryChange={(query) => setQueryState((s) => ({ ...s, query }))}
                onQuery={() => recordListRef.current?.executeQuery(queryState.query)}
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
        opened={exportState.modalOpened}
        onClose={() => setExportState((s) => ({ ...s, modalOpened: false }))}
        onExportStart={() => setExportState((s) => ({ ...s, exportInProgress: true }))}
        onExportComplete={() => setExportState((s) => ({ ...s, exportInProgress: false }))}
      />
      <ConsumerConfigurationModal
        topicName={topicName}
        opened={consumerModalOpened}
        onClose={onConsumerModalClose}
        onSubmit={onStartConsumer}
      />
    </>
  );
};

const useConsumer = (clusterId: string, topicName: string) => {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  const [isRunning, setIsRunning] = useState(false);
  const {
    data: consumerState,
    isLoading,
    refetch,
  } = useQuery(["getConsumerState", clusterId, topicName], () => getConsumerState(clusterId, topicName), {
    refetchInterval,
  });

  useMemo(() => {
    if (consumerState) {
      setIsRunning(consumerState.isRunning);
    }
  }, [consumerState]);

  // consumer modal
  const [consumerModalOpened, setConsumerModalOpened] = useState(false);

  const _startConsumer = async (config: ConsumerConfiguration) => {
    setIsRunning(true);
    setConsumerModalOpened(false);
    await startConsumer(clusterId, topicName, config);
    refetch();
    setRefetchInterval(1000);
  };

  return {
    configureConsumer: () => setConsumerModalOpened(true),
    onStartConsumer: _startConsumer,
    onStopConsumer: async () => {
      await stopConsumer(clusterId, topicName);
      setRefetchInterval(false);
      refetch();
    },
    onConsumerModalClose: () => setConsumerModalOpened(false),
    consumerModalOpened,
    isRunning,
    consumedRecordsCount: consumerState?.recordCount ?? 0,
    isLoading,
  };
};

const useTopicInfo = (clusterId: string, topicName: string) => {
  const { getLastOffsets, getTopicInfo } = useAdmin();
  const { data: estimatedRecords } = useQuery(["getLastOffsets", clusterId, topicName], () =>
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

  return { estimatedRecords, topicInfo };
};
