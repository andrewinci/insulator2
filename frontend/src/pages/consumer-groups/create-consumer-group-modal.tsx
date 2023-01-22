import { ActionIcon, Button, Center, Chip, Group, Input, Select, Stack, Text, TextInput } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { IconTrash } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { SingleLineTitle } from "../../components";
import { dateTimeToUnixTimeMs } from "../../helpers/date-time";
import { ConsumerOffsetConfiguration } from "../../models";
import { setConsumerGroup, listTopics } from "../../tauri/admin";

type ConsumerGroupModalState = {
  name: string;
  topics: string[];
  offset: string;
  isCreating: boolean;
  date: Date | null;
  time: Date | null;
};

const mapOffset = ({
  offset,
  date,
  time,
}: {
  offset: string;
  date: Date | null;
  time: Date | null;
}): ConsumerOffsetConfiguration => {
  switch (offset) {
    case "Beginning":
      return "Beginning";
    case "End":
      return "End";
    case "Time":
      if (date && time) {
        return { Custom: { start_timestamp: dateTimeToUnixTimeMs(date, time) } };
      } else throw "Unable to set the offset timestamp: Missing date and time";
    default:
      throw "Invalid offset";
  }
};

export const CreateConsumerGroupModal = ({ clusterId, close }: { clusterId: string; close: () => void }) => {
  const { data } = useQuery(["listTopics", clusterId], () => listTopics(clusterId));
  const nowUTC = dayjs.utc().toDate();
  const zeroUTC = dayjs().set("h", 0).set("m", 0).set("s", 0).toDate();

  const [state, setState] = useState<ConsumerGroupModalState>({
    name: "",
    topics: [],
    offset: "Beginning",
    isCreating: false,
    date: nowUTC,
    time: zeroUTC,
  });

  return (
    <Stack>
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
      <Input.Wrapper label="Set offset">
        <Chip.Group
          position="left"
          multiple={false}
          onChange={(v) => setState((s) => ({ ...s, offset: v }))}
          value={state.offset}>
          <Chip value="Beginning">Beginning</Chip>
          <Chip value="End">End</Chip>
          <Chip value="Time">Custom time</Chip>
        </Chip.Group>
      </Input.Wrapper>
      <Group hidden={state.offset !== "Time"}>
        <DatePicker label="Date" value={state.date} onChange={(v) => setState((s) => ({ ...s, date: v }))} />
        <TimeInput withSeconds label="Time" value={state.time} onChange={(v) => setState((s) => ({ ...s, time: v }))} />
      </Group>
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
      <Center>
        <Text weight={"bold"}>Topics to include in the consumer group</Text>
      </Center>
      <Stack spacing={3}>
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
            await setConsumerGroup(clusterId, state.name, state.topics, mapOffset(state));
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
