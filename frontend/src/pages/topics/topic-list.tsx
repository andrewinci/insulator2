import { ItemList } from "../common";
import { listTopics } from "../../tauri/admin";
import { Title } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "../../hooks/use-favorites";
import { CreateTopicModal } from "./modals/create-topic-modal";

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
