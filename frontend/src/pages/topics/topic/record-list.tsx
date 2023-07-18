import { Text, Loader, Center } from "@mantine/core";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { KafkaRecord } from "../../../models/kafka";
import { getRecordsPage } from "../../../tauri/consumer";
import { RecordDetailsModal } from "../modals/record-view-modal";
import { KafkaRecordCard } from "./kafka-record-card";

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
        try {
          return await getRecordsPage(clusterId, topic, pageParam ?? 0, state.query);
        } catch (err) {
          return empty;
        }
      } else return empty;
    },
    {
      getNextPageParam: (lastPage, _) => lastPage.nextPage,
      getPreviousPageParam: (firstPage, _) => firstPage.prevPage,
      refetchOnWindowFocus: false,
    },
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

  const [recordModalState, setRecordModalState] = useState({
    opened: false,
    record: null as KafkaRecord | null,
  });

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
                  index={virtualItem.index}
                  record={allRecords[virtualItem.index]}
                  height={RECORD_PAGE_HEIGHT - 5}
                  onOpenDetails={(record) => setRecordModalState({ opened: true, record })}
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
      {recordModalState.record && (
        <RecordDetailsModal
          clusterId={clusterId}
          record={recordModalState.record}
          onClose={() => setRecordModalState((s) => ({ ...s, opened: false }))}
          opened={recordModalState.opened}
          topic={topic}
        />
      )}
    </>
  );
});

RecordsList.displayName = "RecordsList";
