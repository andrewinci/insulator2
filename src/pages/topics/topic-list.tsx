import { useMemo, useState } from "react";
import { useNotifications } from "../../providers";
import { ItemList } from "../common";
import { createTopic, getTopicNamesList } from "../../tauri/admin";
import { Button, Checkbox, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { openModal, useModals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { useParams } from "react-router-dom";

type TopicListProps = {
  onTopicSelected: (topicName: string) => void;
};

export const TopicList = (props: TopicListProps) => {
  const { onTopicSelected } = props;
  const { clusterId } = useParams();
  const { success } = useNotifications();
  const [state, setState] = useState<{ topics: string[]; search?: string; loading: boolean }>({
    topics: [],
    loading: true,
  });
  if (!clusterId) {
    throw Error("Missing clusterId in path!");
  }

  const updateTopicList = (force = false) => {
    if (clusterId) {
      setState({ ...state, loading: true });
      getTopicNamesList(clusterId, force)
        .then((topics) => setState({ topics, loading: false }))
        .then((_) => success("List of topics updated"))
        .catch(() => {
          setState({ topics: [], loading: false });
        });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateTopicList(), [clusterId]);

  const onCreateTopic = () =>
    openModal({
      title: <Title order={3}>Consumer settings</Title>,
      children: <CreateTopicModal clusterId={clusterId} updateTopicList={updateTopicList} />,
      closeOnClickOutside: false,
    });

  return (
    <ItemList
      title="Topics"
      listId={`topic-${clusterId}`}
      loading={state.loading}
      items={state.topics}
      onItemSelected={onTopicSelected}
      onRefreshList={() => updateTopicList(true)}
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
          <Button type="submit">Create 🚀</Button>
        </Group>
      </Stack>
    </form>
  );
};
