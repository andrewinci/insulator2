import { Text, Button, Container, Divider, Group, Stack, Grid, Center, Loader, Menu, Accordion } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconFlag, IconPlayerPlay, IconRefresh, IconTool } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PageHeader } from "../../components";
import { ConsumerGroupInfo, ConsumerSettingsFrom } from "../../models";
import { describeConsumerGroup, getConsumerGroupState, setConsumerGroup } from "../../tauri/admin";

export const ConsumerGroup = ({ name, clusterId }: { name: string; clusterId: string }) => {
  const { data: consumerGroupState } = useQuery(["getConsumerGroupState", clusterId, name], () =>
    getConsumerGroupState(clusterId, name)
  );
  let data: ConsumerGroupInfo | undefined = undefined;
  const {
    isLoading,
    data: temp,
    refetch,
    isRefetching,
  } = useQuery(
    ["describeConsumerGroup", clusterId, name],
    () => describeConsumerGroup(clusterId, name, data ? true : false), // ignore cache if we already have data (hence it's a refresh)
    { refetchOnWindowFocus: false, refetchOnMount: false }
  );
  data = temp;

  const topicOffsetMap = useMemo(() => {
    if (!data) return;
    console.log(data);
    const map = data.offsets.reduce((prev, current) => {
      if (!prev[current.topic]) {
        prev[current.topic] = { lag: 0, offsets: [] };
      }
      prev[current.topic].lag += current.last_offset - current.offset;
      prev[current.topic].offsets.push({ offset: current.offset, partition: current.partition_id });
      return prev;
    }, {} as Record<string, { lag: number; offsets: { partition: number; offset: number }[] }>);
    return Object.entries(map).sort();
  }, [data]);

  return (
    <Container>
      <PageHeader title={name} subtitle={`topics: ${topicOffsetMap?.length}, status: ${consumerGroupState ?? "..."}`} />
      <Divider my={10} />

      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        <ResetOffsetMenu
          loading={isLoading}
          disabled={isRefetching}
          clusterId={clusterId}
          data={data}
          refresh={refetch}
        />

        {isLoading && (
          <Center mt={10}>
            <Loader />
          </Center>
        )}
        {!isLoading && data && topicOffsetMap && (
          <>
            <Container sx={{ overflowX: "hidden", overflowY: "scroll", width: "100%", height: "calc(100vh - 180px)" }}>
              <Accordion chevronPosition="left" variant="contained" defaultValue="customization">
                {topicOffsetMap.map(([topic, details]) => (
                  <Accordion.Item key={topic} value={topic}>
                    <Accordion.Control>
                      <Group position="apart">
                        <Text weight={"bold"} size={"md"}>
                          {topic}
                        </Text>
                        <Text italic size={"md"}>
                          Lag: {details.lag}
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
                        <Grid.Col span={3}>
                          <Text align="left" weight={"bold"}>
                            Partition
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text align="left" weight={"bold"}>
                            Offset
                          </Text>
                        </Grid.Col>
                        {details.offsets.map(({ offset, partition }) => (
                          <>
                            <Grid.Col span={6}>
                              <Text sx={{ overflowWrap: "break-word" }} key={`topic-${partition}`}>
                                {topic}
                              </Text>
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <Text key={`partition-${partition}`}>{partition}</Text>
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <Text key={`offset-${partition}`}>{offset}</Text>
                            </Grid.Col>
                          </>
                        ))}
                      </Grid>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Container>
          </>
        )}
      </Stack>
    </Container>
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
