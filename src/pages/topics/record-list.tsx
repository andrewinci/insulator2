import styled from "@emotion/styled";
import { Paper, Text, Group } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { KafkaRecord } from "../../models/kafka";
import { getRecordsPage } from "../../tauri/consumer";

type RecordsListProps = {
  clusterId: string;
  topic: string;
  query: string;
  heightOffset?: number;
};

const RECORD_PAGE_HEIGHT = 135;

export const RecordsList = (props: RecordsListProps) => {
  const { clusterId, topic, heightOffset, query } = props;

  const [state, setState] = useState<{ windowHeight: number }>({
    windowHeight: window.innerHeight,
  });

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["fetchRecords", clusterId, topic, query],
    async ({ pageParam = 0 }) => await getRecordsPage(clusterId, topic, pageParam ?? 0, query),
    {
      getNextPageParam: (lastPage, _) => lastPage.nextPage,
      getPreviousPageParam: (firstPage, _) => firstPage.prevPage,
      refetchInterval: 500,
    }
  );
  const allRecords = data ? data.pages.flatMap((d) => d.records) : [];

  useEffect(() => {
    const handleWindowResize = () => setState((s) => ({ ...s, windowHeight: window.innerHeight }));
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRecords.length + 1 : allRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => RECORD_PAGE_HEIGHT,
    overscan: 10,
  });

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
          {rowVirtualizer.getVirtualItems().map((virtualItem) =>
            allRecords[virtualItem.index] ? (
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
            ) : (
              <Text key={`load-more-${virtualItem.index}`}>No records to show</Text>
            )
          )}
        </div>
      </div>
    </>
  );
};

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
