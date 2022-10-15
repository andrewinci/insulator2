import { Text, Button, Container, Divider, Group, Center, Stack, SimpleGrid } from "@mantine/core";
import { IconRefresh } from "@tabler/icons";
import { useState } from "react";
import { SingleLineTitle } from "../../components";
import { ConsumerGroupInfo } from "../../models/kafka";
import { describeConsumerGroup } from "../../tauri";

export const ConsumerGroup = ({ name, clusterId }: { name: string; clusterId: string }) => {
  const [state, setState] = useState<ConsumerGroupInfo | undefined>(undefined);
  const retrieveConsumerGroup = () => {
    describeConsumerGroup(clusterId, name).then((cgi) => setState(cgi));
  };
  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <SingleLineTitle>{name}</SingleLineTitle>
      </Group>
      <Divider my={10} />

      <Stack m={10} align={"stretch"} justify={"flex-start"}>
        {!state && (
          <Center mt={10}>
            <Text>Retrive the consumer group info may take few minutes. Click the button to start the process.</Text>
            <Button onClick={retrieveConsumerGroup}>
              <IconRefresh /> Get consumer group info
            </Button>
          </Center>
        )}
        {state && (
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
        )}
      </Stack>
    </Container>
  );
};
