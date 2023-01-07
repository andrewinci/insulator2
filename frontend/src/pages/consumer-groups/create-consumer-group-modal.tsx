import { ActionIcon, Button, Center, Chip, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SingleLineTitle } from "../../components";
import { ConsumerOffsetConfiguration } from "../../models";
import { setConsumerGroup, listTopics } from "../../tauri/admin";

export const CreateConsumerGroupModal = ({ clusterId, close }: { clusterId: string; close: () => void }) => {
  const { data } = useQuery(["listTopics", clusterId], () => listTopics(clusterId));
  const [state, setState] = useState<{ name: string; topics: string[]; offset: string; isCreating: boolean }>({
    name: "",
    topics: [],
    offset: "Beginning",
    isCreating: false,
  });

  return (
    <Stack spacing={0}>
      <TextInput
        required
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        value={state.name}
        onChange={(event) => {
          if (event && event.target) setState((s) => ({ ...s, name: event?.target?.value }));
        }}
        label="Consumer group name"
      />
      <Text mt={10} size={15}>
        Set offset
      </Text>
      <Chip.Group
        position="left"
        multiple={false}
        onChange={(v) => setState((s) => ({ ...s, offset: v }))}
        value={state.offset}>
        <Chip value="Beginning">Beginning</Chip>
        <Chip value="End">End</Chip>
        {/* <Chip value="Custom">Custom Time</Chip> */}
      </Chip.Group>
      <Select
        mt={10}
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
          onClick={async () => {
            setState((s) => ({ ...s, isCreating: true }));
            await setConsumerGroup(clusterId, state.name, state.topics, state.offset as ConsumerOffsetConfiguration);
            setState((s) => ({ ...s, isCreating: false }));
            close();
          }}
          type="submit"
          loading={state.isCreating}>
          Create
        </Button>
      </Group>
    </Stack>
  );
};
