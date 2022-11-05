import { Text, Button, Container, Group, Stack, Grid, Center, Loader, Menu, Accordion } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconFlag, IconPlayerPlay, IconRefresh, IconTool } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useMemo } from "react";
import { PageHeader } from "../../components";
import { ConsumerGroupInfo, ConsumerSettingsFrom } from "../../models";
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
      <PageHeader title={name} subtitle={`topics: ${topicOffsetMap?.length}, status: ${consumerGroupState ?? "..."}`} />
      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        <ResetOffsetMenu
          loading={isLoading}
          disabled={isRefetching}
          clusterId={clusterId}
          data={consumerGroupInfo}
          refresh={refetch}
        />

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

const ResetOffsetMenu = (props: {
  loading: boolean;
  disabled: boolean;
  clusterId: string;
  data: ConsumerGroupInfo | undefined;
  refresh: () => void;
}) => {
  const { clusterId, loading, disabled, data, refresh } = props;
  const [state, setState] = useSetState<{ isResetting: boolean }>({ isResetting: false });

  const resetOffset = (offset: ConsumerSettingsFrom) => {
    if (!data) return;
    openConfirmModal({
      title: "Reset offset",
      children: (
        <>
          <Text size="sm">
            Are you sure to reset the offset of the consumer group{" "}
            <Text component="span" weight={"bold"}>
              {data.name}
            </Text>{" "}
            to{" "}
            <Text component="span" weight={"bold"}>
              {offset.toString()}
            </Text>
            ?
          </Text>
          <Text my={10} size="sm" color={"red"}>
            This action is irreversible.
          </Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: async () => {
        if (!data) return;
        setState({ isResetting: true });
        try {
          await setConsumerGroup(
            clusterId,
            data.name,
            data.offsets.map((o) => o.topic),
            offset
          ).then((_) => refresh());
        } finally {
          setState({ isResetting: false });
        }
      },
    });
  };

  return (
    <Group>
      <Button mb={10} size="xs" leftIcon={<IconRefresh />} onClick={() => refresh()} loading={loading || disabled}>
        Refresh
      </Button>

      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button mb={10} size="xs" leftIcon={<IconTool />} disabled={loading || disabled} loading={state.isResetting}>
            Reset offset
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => resetOffset("Beginning")} icon={<IconPlayerPlay size={14} />}>
            Reset to the beginning
          </Menu.Item>
          <Menu.Item onClick={() => resetOffset("End")} icon={<IconFlag size={14} />}>
            Reset to end
          </Menu.Item>
          {/* <Menu.Item icon={<IconClock size={14} />}>Reset to a point in time</Menu.Item> */}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
