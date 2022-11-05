import { Text, Container, Group, Stack, Grid, Center, Loader, Menu, Accordion, ActionIcon } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconFlag, IconPlayerPlay, IconRefresh, IconTool } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useMemo } from "react";
import { PageHeader } from "../../components";
import { ConsumerGroupInfo, ConsumerSettingsFrom } from "../../models";
import { useNotifications } from "../../providers";
import { describeConsumerGroup, getConsumerGroupState, getLastOffsets, setConsumerGroup } from "../../tauri/admin";

export const ConsumerGroup = ({ name, clusterId }: { name: string; clusterId: string }) => {
  const { data: consumerGroupState } = useQuery(["getConsumerGroupState", clusterId, name], () =>
    getConsumerGroupState(clusterId, name)
  );
  const {
    isLoading,
    data: consumerGroupInfo,
    refetch,
    isRefetching,
  } = useQuery(["describeConsumerGroup", clusterId, name], () => describeConsumerGroup(clusterId, name, true), {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
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
    <Container>
      <PageHeader title={name} subtitle={`topics: ${topicOffsetMap?.length}, status: ${consumerGroupState ?? "..."}`}>
        <Tools
          loading={isLoading}
          disabled={isRefetching}
          clusterId={clusterId}
          data={consumerGroupInfo}
          refresh={refetch}
        />
      </PageHeader>
      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        {isLoading && (
          <Center mt={10}>
            <Loader />
          </Center>
        )}
        {!isLoading && topicOffsetMap && (
          <>
            <Container sx={{ overflowX: "hidden", overflowY: "scroll", width: "100%", height: "calc(100vh - 180px)" }}>
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

const ConsumerGroupTopicDetails = ({
  clusterId,
  topicName,
  offsets,
}: {
  clusterId: string;
  topicName: string;
  offsets: { partition: number; offset: number }[];
}) => {
  const { data } = useQuery(["getLastOffsets", clusterId, topicName, offsets], async () => {
    const lastOffsets = (await getLastOffsets(clusterId, [topicName]))[topicName];
    const sumLastOffsets = lastOffsets.map((po) => po.offset).reduce((a, b) => a + b, 0);
    const sumOffsets = offsets.map((o) => o.offset).reduce((a, b) => a + b, 0);
    console.log(lastOffsets);
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

const Tools = (props: {
  loading: boolean;
  disabled: boolean;
  clusterId: string;
  data: ConsumerGroupInfo | undefined;
  refresh: () => void;
}) => {
  const { clusterId, loading, disabled, data, refresh } = props;
  const [state, setState] = useSetState<{ isResetting: boolean }>({ isResetting: false });
  const { success } = useNotifications();

  const resetOffset = async (offset: ConsumerSettingsFrom) => {
    if (!data) return;
    setState({ isResetting: true });
    try {
      await setConsumerGroup(
        clusterId,
        data.name,
        data.offsets.map((o) => o.topic),
        offset
      ).then((_) => {
        success("Consumer group updated successfully");
        refresh();
      });
    } finally {
      setState({ isResetting: false });
    }
  };

  const showResetOffsetModal = (offset: ConsumerSettingsFrom) => {
    if (!data) return;
    openConfirmModal({
      title: "Reset consumer group to the beginning",
      children: (
        <>
          <Text size="sm">
            {`Are you sure to reset the offset of ALL topics in the consumer group ${data.name} to the ${offset}?`}
          </Text>
          <Text my={10} size="sm" color={"red"}>
            This action is irreversible.
          </Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      closeOnEscape: false,
      closeOnClickOutside: false,
      onConfirm: async () => await resetOffset(offset),
    });
  };

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          {state.isResetting || loading || disabled ? <Loader /> : <IconTool />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item icon={<IconRefresh size={14} />} onClick={() => refresh()} disabled={loading || disabled}>
          Refresh
        </Menu.Item>
        <Menu.Label>Reset offset</Menu.Label>
        <Menu.Item
          color={"orange"}
          onClick={() => showResetOffsetModal("Beginning")}
          icon={<IconPlayerPlay size={14} />}>
          Reset to the beginning
        </Menu.Item>
        <Menu.Item color={"orange"} onClick={() => showResetOffsetModal("End")} icon={<IconFlag size={14} />}>
          Reset to end
        </Menu.Item>
        {/* <Menu.Item icon={<IconClock size={14} />}>Reset to a point in time</Menu.Item> */}
      </Menu.Dropdown>
    </Menu>
  );
};
