import { Text, Button, Container, Divider, Group, Stack, Grid, Center, Loader } from "@mantine/core";
import { IconRefresh } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components";
import { describeConsumerGroup } from "../../tauri/admin";

export const ConsumerGroup = ({ name, clusterId }: { name: string; clusterId: string }) => {
  const { isLoading, data, refetch, isRefetching } = useQuery(["describeConsumerGroup", clusterId, name], () =>
    describeConsumerGroup(clusterId, name)
  );

  return (
    <Container>
      <PageHeader title={name} subtitle={`status: ${data?.state ?? "..."}`} />
      <Divider my={10} />

      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        <Group>
          <Button mb={10} size="xs" leftIcon={<IconRefresh />} onClick={() => refetch()} loading={isRefetching}>
            Refresh
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
        {isLoading && (
          <Center mt={10}>
            <Loader />
          </Center>
        )}
        {!isLoading && data && (
          <>
            <Container sx={{ overflowX: "hidden", overflowY: "scroll", width: "100%", height: "calc(100vh - 180px)" }}>
              <Grid>
                <Grid.Col span={8}>
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
                {data.offsets.map((o, i) => (
                  <>
                    <Grid.Col span={8}>
                      <Text sx={{ overflowWrap: "break-word" }} key={`topic-${i}`}>
                        {o.topic}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text key={`partition-${i}`}>{o.partition_id}</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text key={`offset-${i}`}>{o.offset}</Text>
                    </Grid.Col>
                  </>
                ))}
              </Grid>
            </Container>
            {/* <Button my={10} color="red">
              Update
            </Button> */}
          </>
        )}
      </Stack>
    </Container>
  );
};
