import styled from "@emotion/styled";
import { Paper, Text, Group, Loader, Center } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { KafkaRecord } from "../../../models/kafka";
import { getRecordsPage } from "../../../tauri/consumer";

type RecordsListProps = {
  clusterId: string;
  topic: string;
  query?: string;
  heightOffset?: number;
};

export type RecordsListRef = {
  executeQuery: (query: string) => Promise<void>;
};

const RECORD_PAGE_HEIGHT = 135;

export const RecordsList = forwardRef<RecordsListRef, RecordsListProps>((props, ref) => {
  const { clusterId, topic, heightOffset } = props;

  const [state, setState] = useState<{ windowHeight: number; query: string | null; isLoading: boolean }>({
    windowHeight: window.innerHeight,
    query: null,
    isLoading: true,
  });

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
      if (state.query) {
        return await getRecordsPage(clusterId, topic, pageParam ?? 0, state.query);
      } else
        return {
          nextPage: null,
          prevPage: null,
          records: [],
        };
    },
    {
      getNextPageParam: (lastPage, _) => lastPage.nextPage,
      getPreviousPageParam: (firstPage, _) => firstPage.prevPage,
    }
  );

  useMemo(() => setState((s) => ({ ...s, isLoading: reactQueryLoading })), [reactQueryLoading]);
  // allow parent to execute the query
  useImperativeHandle(ref, () => ({
    async executeQuery(query: string) {
      setState((s) => ({ ...s, query, isLoading: true }));
      await refetch();
      setState((s) => ({ ...s, isLoading: false }));
    },
  }));
  const allRecords = data ? data.pages.flatMap((d) => d.records) : [];

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRecords.length + 1 : allRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => RECORD_PAGE_HEIGHT,
    overscan: 2,
  });

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem && lastItem.index >= allRecords.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
      <div
        ref={parentRef}
        style={{
          height: state.windowHeight - (heightOffset ?? 0),
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
  index,
  style,
}: {
  record: KafkaRecord;
  index: number;
  style: React.CSSProperties;
}) => {
  const timestamp = record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A";
  return (
    <Paper
      shadow="xs"
      p={5}
      withBorder
      style={{ ...style, maxHeight: RECORD_PAGE_HEIGHT - 5, width: "calc(100% - 20px)" }}>
      <Text weight={"bold"} size={13}>
        {index} - {record?.key}
      </Text>
      <Group spacing={0} noWrap={true} style={{ height: 12 }}>
        <LabelValue label="partition: " value={record?.partition} />
        <LabelValue label="offset: " value={record?.offset} />
        <LabelValue label="timestamp: " value={timestamp} />
      </Group>
      <CustomPrism mt={2} copyLabel="Copy" language={"json"}>
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
