import { Text, Button, Container, Divider, Group, Stack, SimpleGrid } from "@mantine/core";
import { IconRefresh } from "@tabler/icons";
import { useMemo, useState } from "react";
import { SingleLineTitle } from "../../components";
import { ConsumerGroupInfo } from "../../models/kafka";
import { describeConsumerGroup } from "../../tauri";

export const ConsumerGroup = ({ name, clusterId }: { name: string; clusterId: string }) => {
  // todo: wip cache last result on the backend
  const [state, setState] = useState<ConsumerGroupInfo | undefined>(undefined);
  useMemo(() => {
    setState(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, clusterId]);

  const retrieveConsumerGroup = useMemo(
    () => async () => {
      await describeConsumerGroup(clusterId, name).then((s) => setState(s));
    },
    [name, clusterId]
  );

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <SingleLineTitle>{name}</SingleLineTitle>
      </Group>
      <Divider my={10} />

      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        <Group>
          <Button mb={10} size="xs" onClick={retrieveConsumerGroup}>
            <IconRefresh /> Refresh
          </Button>

          {/*
            todo: allow reset each single topic/partition
            <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button mb={10} size="xs">
                <IconTool /> Reset offset tool
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item icon={<IconPlayerPlay size={14} />}>Reset to the beginning</Menu.Item>
              <Menu.Item icon={<IconFlag size={14} />}>Reset to end</Menu.Item>
              <Menu.Item icon={<IconClock size={14} />}>Reset to a point in time</Menu.Item>
            </Menu.Dropdown>
          </Menu> */}
        </Group>
        {state && (
          <>
            <SimpleGrid cols={3}>
              <Text weight={"bold"}>Topic</Text>
              <Text weight={"bold"}>Partition</Text>
              <Text weight={"bold"}>Offset</Text>
              {state.offsets.map((o, i) => (
                <>
                  <Text key={`topic-${i}`}>{o.topic}</Text>
                  <Text key={`partition-${i}`}>{o.partition_id}</Text>
                  <Text key={`offset-${i}`}>{o.offset}</Text>
                </>
              ))}
            </SimpleGrid>
            {/* <Button my={10} color="red">
              Update
            </Button> */}
          </>
        )}
      </Stack>
    </Container>
  );
};
