import { Button, Checkbox, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal, useModals } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { createTopic, listTopics } from "@tauri/admin";

import { useFavorites } from "../../hooks/use-favorites";
import { ItemList } from "../common";

type TopicListProps = {
  clusterId: string;
  onTopicSelected: (topicName: string) => void;
};

export const TopicList = (props: TopicListProps) => {
  const { onTopicSelected, clusterId } = props;
  const { isFetching, isLoading, data, refetch } = useQuery(["listTopics", clusterId], () => listTopics(clusterId));

  const onCreateTopic = () =>
    openModal({
      title: <Title order={3}>Consumer settings</Title>,
      children: <CreateTopicModal clusterId={clusterId} updateTopicList={refetch} />,
      closeOnClickOutside: false,
    });

  const { favorites, toggleFavorite } = useFavorites(clusterId, "topics");

  return (
    <ItemList
      title="Topics"
      listId={`topic-${clusterId}`}
      isLoading={isLoading}
      favorites={favorites}
      onFavToggled={toggleFavorite}
      isFetching={isFetching}
      items={data ?? []}
      onItemSelected={onTopicSelected}
      onRefreshList={refetch}
      onAddClick={() => onCreateTopic()} //
    />
  );
};

type CreateTopicForm = {
  name: string;
  partitions: number;
  isr: number;
  compacted: boolean;
};

const CreateTopicModal = ({ clusterId, updateTopicList }: { clusterId: string; updateTopicList: () => void }) => {
  const { closeAll } = useModals();
  const form = useForm<CreateTopicForm>({
    initialValues: {
      name: "",
      compacted: false,
      partitions: 3,
      isr: 1,
    },
    validate: {
      name: (v) => {
        if (v.length == 0) return "Topic name must be not empty";
        if (v.includes(" ")) return "Spaces in the topic name are not allowed";
        return null;
      },
      partitions: (v) => (v > 0 ? null : "Number of partitions must be greater than 0"),
      isr: (v) => (v > 0 ? null : "Number of in sync replicas must be greater than 0"),
    },
  });
  const onSubmit = async (v: CreateTopicForm) => {
    await createTopic(clusterId, v.name, v.partitions, v.isr, v.compacted).then(closeAll).then(updateTopicList);
  };
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput label="Topic name" {...form.getInputProps("name")} />
        <NumberInput min={1} label="Partitions" {...form.getInputProps("partitions")} />
        <NumberInput min={1} label="In sync replicas" {...form.getInputProps("isr")} />
        <Checkbox label="Compacted" {...form.getInputProps("compacted", { type: "checkbox" })} />
        <Group mt={10} position="right">
          <Button type="submit">Create</Button>
        </Group>
      </Stack>
    </form>
  );
};
