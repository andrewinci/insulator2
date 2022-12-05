import { SingleLineTitle } from "@components";
import { ActionIcon, Button, Center, Chip, Group, Modal, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { ConsumerOffsetConfiguration } from "@models";
import { IconTrash } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { getConsumerGroups, listTopics, setConsumerGroup } from "@tauri/admin";
import { useState } from "react";

import { useFavorites } from "../../hooks/use-favorites";
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
  const { favorites, toggleFavorite } = useFavorites(clusterId, "consumers");
  return (
    <>
      <ItemList
        title="Consumers"
        listId={`consumer-groups-${clusterId}`}
        onAddClick={() => setOpened(true)}
        isFetching={isFetching}
        isLoading={isLoading}
        favorites={favorites}
        onFavToggled={toggleFavorite}
        items={data ?? []}
        onItemSelected={onConsumerSelected}
        onRefreshList={refetch}
      />
      <Modal
        closeOnEscape={false}
        closeOnClickOutside={false}
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title order={3}>Create consumer group</Title>}>
        <CreateConsumerGroupModal
          clusterId={clusterId}
          close={() => {
            setOpened(false);
            refetch();
          }}
        />
      </Modal>
    </>
  );
};

const CreateConsumerGroupModal = ({ clusterId, close }: { clusterId: string; close: () => void }) => {
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
