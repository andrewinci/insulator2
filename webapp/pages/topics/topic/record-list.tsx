import styled from "@emotion/styled";
import { ActionIcon, Center, Group, Loader, Paper, Text, Title, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { Prism } from "@mantine/prism";
import { IconCopy, IconEye } from "@tabler/icons";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getRecordsPage } from "@tauri/consumer";
import dayjs from "dayjs";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

import { pretty } from "../../../helpers/json";
import { KafkaRecord } from "../../../models/kafka";
import { RecordDetailsModal } from "./modals/record-view-modal";

type RecordsListProps = {
  clusterId: string;
  topic: string;
  query?: string;
  height?: number;
};

export type RecordsListRef = {
  executeQuery: (query: string) => Promise<void>;
};

const RECORD_PAGE_HEIGHT = 135;

export const RecordsList = forwardRef<RecordsListRef, RecordsListProps>((props, ref) => {
  const { clusterId, topic, height } = props;

  const [state, setState] = useState<{ query: string | null; isLoading: boolean }>({
    query: null,
    isLoading: true,
  });

  const queryClient = useQueryClient();
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: reactQueryLoading,
    refetch,
  } = useInfiniteQuery(
    ["fetchRecords", clusterId, topic, state.query],
    async ({ pageParam = 0 }) => {
      const empty = {
        nextPage: null,
        prevPage: null,
        records: [],
      };
      if (state.query) {
        console.log(`Query pageParam ${pageParam}`);
        try {
          return await getRecordsPage(clusterId, topic, pageParam ?? 0, state.query);
        } catch (err) {
          console.error(err);
          return empty;
        }
      } else return empty;
    },
    {
      getNextPageParam: (lastPage, _) => lastPage.nextPage,
      getPreviousPageParam: (firstPage, _) => firstPage.prevPage,
      refetchOnWindowFocus: false,
    }
  );

  const allRecords = data ? data.pages.flatMap((d) => d.records) : [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRecords.length + 1 : allRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => RECORD_PAGE_HEIGHT,
    overscan: 2,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem && lastItem.index >= allRecords.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  useMemo(() => setState((s) => ({ ...s, isLoading: reactQueryLoading })), [reactQueryLoading]);

  // allow parent to execute the query
  useImperativeHandle(ref, () => ({
    async executeQuery(query: string) {
      // avoid to refetch all pages fetched with the previous query
      queryClient.setQueryData<InfiniteData<unknown>>(["fetchRecords", clusterId, topic, state.query], (data) => ({
        pages: data?.pages.slice(0, 1) ?? [],
        pageParams: data?.pageParams.slice(0, 1) ?? [],
      }));
      setState((s) => ({ ...s, query, isLoading: true }));
      await refetch();
      setState((s) => ({ ...s, isLoading: false }));
    },
  }));

  const parentRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={parentRef}
        style={{
          height: height,
          overflow: "auto", // Make it scroll!
        }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}>
          <Center
            style={{
              position: "absolute",
              top: 10,
              left: 0,
              width: "100%",
            }}>
            {state.isLoading && <Loader></Loader>}
            {!state.isLoading && allRecords.length == 0 && (
              <Text size={"xs"} align="center">
                No records to show.
                <br /> Click the Query button to refresh this table{" "}
              </Text>
            )}
          </Center>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            if (allRecords.length > 0 && hasNextPage && allRecords.length <= virtualItem.index) {
              return (
                <Center
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  key={`load-more-${virtualItem.index}`}>
                  <Loader></Loader>
                </Center>
              );
            } else {
              return (
                <KafkaRecordCard
                  key={virtualItem.index}
                  topic={topic}
                  index={virtualItem.index}
                  record={allRecords[virtualItem.index]}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              );
            }
          })}
        </div>
      </div>
    </>
  );
});
RecordsList.displayName = "RecordsList";

const LabelValue = ({ label, value }: { label: string; value: string | number }) => (
  <>
    <Text size={12}>{label}</Text>
    <Text size={12} weight={"bold"} mr={8}>
      {value}
    </Text>
  </>
);

const KafkaRecordCard = ({
  record,
  topic,
  index,
  style,
}: {
  record: KafkaRecord;
  topic: string;
  index: number;
  style: React.CSSProperties;
}) => {
  const timestamp = record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A";
  const clipboard = useClipboard();
  const openDetails = (record: KafkaRecord) =>
    openModal({
      title: <Title order={3}>Record details</Title>,
      children: <RecordDetailsModal topic={topic} record={record} />,
      size: 700,
    });

  const [copyState, setCopyState] = useState<{ color?: string }>({ color: undefined });
  return (
    <Paper
      shadow="xs"
      p={5}
      withBorder
      style={{ ...style, maxHeight: RECORD_PAGE_HEIGHT - 5, width: "calc(100% - 20px)" }}>
      <Group position="apart" align="flex-start" mt={-3} p={0} style={{ height: 20 }}>
        <Text weight={"bold"} size={13}>
          {index} - {record?.key}
        </Text>
        <Group position="right" spacing={0}>
          <Tooltip label="Copy record" color={copyState.color}>
            <ActionIcon
              onClick={() => {
                clipboard.copy(pretty(record.payload));
                setCopyState({ color: "green" });
                setTimeout(() => setCopyState({}), 600);
              }}>
              <IconCopy size={20}></IconCopy>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Record details">
            <ActionIcon onClick={() => openDetails(record)}>
              <IconEye size={20}></IconEye>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Group spacing={0} noWrap={true} style={{ height: 12 }}>
        <LabelValue label="partition: " value={record?.partition} />
        <LabelValue label="offset: " value={record?.offset} />
        <LabelValue label="timestamp: " value={timestamp} />
      </Group>
      <CustomPrism mt={2} noCopy={true} language={"json"}>
        {record?.payload ?? ""}
      </CustomPrism>
    </Paper>
  );
};

const CustomPrism = styled(Prism)`
  code[class*="language-"],
  pre[class*="language-"] {
    padding-right: 20px; //avoid to have text under the copy icon
    font-size: 13px;
    white-space: normal !important;
    word-break: break-word !important;
    height: 85px;
  }
  pre {
    height: 80px;
    overflow-y: auto;
  }
`;
