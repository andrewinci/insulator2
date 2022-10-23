import { ActionIcon, Button, Center, Group, Modal, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SingleLineTitle } from "../../components";
import { createConsumerGroup, getConsumerGroups, listTopics } from "../../tauri/admin";
import { ItemList } from "../common";

type SchemaListProps = {
  clusterId: string;
  onConsumerSelected: (consumerName: string) => void;
};

export const ConsumerGroupsList = (props: SchemaListProps) => {
  const [opened, setOpened] = useState(false);
  const { clusterId, onConsumerSelected } = props;
  const { isLoading, isFetching, data, refetch } = useQuery(["getConsumerGroups", clusterId], () =>
    getConsumerGroups(clusterId)
  );
  return (
    <>
      <ItemList
        title="Consumers"
        listId={`consumer-groups-${clusterId}`}
        onAddClick={() => setOpened(true)}
        isFetching={isFetching}
        isLoading={isLoading}
        items={data ?? []}
        onItemSelected={onConsumerSelected}
        onRefreshList={refetch}
      />
      <Modal opened={opened} onClose={() => setOpened(false)} title={<Title order={3}>Create consumer group</Title>}>
        <CreateConsumerGroupModal clusterId={clusterId} close={() => setOpened(false)} />
      </Modal>
    </>
  );
};

const CreateConsumerGroupModal = ({ clusterId, close }: { clusterId: string; close: () => void }) => {
  const { data } = useQuery(["listTopics", clusterId], () => listTopics(clusterId));
  const [state, setState] = useState<{ name: string; topics: string[] }>({ name: "", topics: [] });

  return (
    <Stack spacing={0}>
      <TextInput required label="Consumer group name"></TextInput>
      <Select
        label="Add topics to the consumer group"
        data={data?.filter((t) => !state.topics.includes(t)) ?? []}
        onChange={(t) => {
          if (t) {
            setState((s) => ({ ...s, topics: [...s.topics, t].sort() }));
          }
        }}
        searchable
      />
      <Center mt={10}>
        <Text weight={"bold"}>Topics to include in the consumer group</Text>
      </Center>
      <Stack spacing={3} my={10}>
        {state.topics.map((t) => (
          <Group position="left" key={t} p={4} sx={{ border: "1px solid gray", borderRadius: "4px" }}>
            <ActionIcon size={23} onClick={() => setState((s) => ({ ...s, topics: s.topics.filter((v) => v != t) }))}>
              <IconTrash color="red" />
            </ActionIcon>
            <SingleLineTitle size={15} style={{ maxWidth: "85%" }}>
              {t}
            </SingleLineTitle>
          </Group>
        ))}
        {state.topics.length == 0 && (
          <Center>
            <Text size={15}>None</Text>
          </Center>
        )}
      </Stack>
      <Group mt={10} position="right">
        <Button
          onClick={() => createConsumerGroup(clusterId, state.name, state.topics).then((_) => close())}
          type="submit">
          Create 🚀
        </Button>
      </Group>
    </Stack>
  );
};
