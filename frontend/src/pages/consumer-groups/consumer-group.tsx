import { Text, Container, Group, Stack, Grid, Center, Loader, Accordion } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useMemo } from "react";
import { PageHeader } from "../../components";
import { useAdmin, useDescribeConsumerGroup } from "../../tauri/admin";
import { ToolsMenu } from "./tools-menu";

type ConsumerGroupProps = {
  clusterId: string;
  name: string;
  onDeleteConsumerGroup: (name: string) => void;
};

export const ConsumerGroup = (props: ConsumerGroupProps) => {
  const { name, clusterId, onDeleteConsumerGroup } = props;
  const { isLoading, data, refetch, isRefetching } = useDescribeConsumerGroup(clusterId, name, true);
  const { info: consumerGroupInfo, state: consumerGroupState } = data ?? { info: undefined, state: undefined };
  const topicOffsetMap = useMemo(() => {
    if (!consumerGroupInfo) return;
    const map = consumerGroupInfo.offsets.reduce((prev, current) => {
      if (!prev[current.topic]) {
        prev[current.topic] = [];
      }
      prev[current.topic].push({ offset: current.offset, partition: current.partition_id });
      return prev;
    }, {} as Record<string, { partition: number; offset: number }[]>);
    return Object.entries(map).sort();
  }, [consumerGroupInfo]);

  return (
    <Container fluid>
      <PageHeader
        title={name}
        subtitle={`topics: ${topicOffsetMap?.length ?? "..."}, status: ${consumerGroupState ?? "..."}`}>
        {consumerGroupInfo && (
          <ToolsMenu
            loading={isLoading}
            disabled={isRefetching}
            clusterId={clusterId}
            data={consumerGroupInfo}
            onRefresh={refetch}
            onDeleteConsumerGroup={onDeleteConsumerGroup}
          />
        )}
      </PageHeader>
      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        {isLoading && (
          <Center mt={10}>
            <Loader />
          </Center>
        )}
        {!isLoading && topicOffsetMap && (
          <>
            <Container
              fluid
              sx={{ overflowX: "hidden", overflowY: "scroll", width: "100%", height: "calc(100vh - 180px)" }}>
              <Accordion chevronPosition="left" variant="contained" defaultValue="customization">
                {topicOffsetMap.map(([topic, details]) => (
                  <ConsumerGroupTopicDetails key={topic} clusterId={clusterId} topicName={topic} offsets={details} />
                ))}
              </Accordion>
            </Container>
          </>
        )}
      </Stack>
    </Container>
  );
};

export const ConsumerGroupTopicDetails = ({
  clusterId,
  topicName,
  offsets,
}: {
  clusterId: string;
  topicName: string;
  offsets: { partition: number; offset: number }[];
}) => {
  const { getLastOffsets } = useAdmin();
  const { data } = useQuery(["getLastOffsets", clusterId, topicName, offsets], async () => {
    const lastOffsets = (await getLastOffsets(clusterId, [topicName]))[topicName];
    const sumLastOffsets = lastOffsets.map((po) => po.offset).reduce((a, b) => a + b, 0);
    const sumOffsets = offsets.map((o) => o.offset).reduce((a, b) => a + b, 0);
    return {
      lastOffsets,
      totalLag: sumLastOffsets - sumOffsets,
    };
  });
  return (
    <Accordion.Item key={topicName} value={topicName}>
      <Accordion.Control>
        <Group position="apart">
          <Text weight={"bold"} size={"md"}>
            {topicName}
          </Text>
          <Text italic size={"md"}>
            Lag: {data?.totalLag ?? "..."}
          </Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Grid>
          <Grid.Col span={6}>
            <Text align="left" weight={"bold"}>
              Topic
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text align="left" weight={"bold"}>
              Partition
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text align="left" weight={"bold"}>
              Offset
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text align="left" weight={"bold"}>
              Lag
            </Text>
          </Grid.Col>
          {offsets.map(({ offset, partition }) => (
            <React.Fragment key={`${topicName}-${partition}`}>
              <Grid.Col span={6}>
                <Text sx={{ overflowWrap: "break-word" }}>{topicName}</Text>
              </Grid.Col>
              <Grid.Col span={2}>
                <Text>{partition}</Text>
              </Grid.Col>
              <Grid.Col span={2}>
                <Text>{offset}</Text>
              </Grid.Col>
              <Grid.Col span={2}>
                <Text>{(data?.lastOffsets.find((po) => po.partitionId === partition)?.offset ?? 0) - offset}</Text>
              </Grid.Col>
            </React.Fragment>
          ))}
        </Grid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};
