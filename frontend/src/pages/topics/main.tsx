import { useSessionStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { Topic } from "./topic/main";
import { Modal, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useFavorites } from "../../hooks/use-favorites";
import { CreateTopicModal } from "./modals/create-topic-modal";
import { useState } from "react";
import { ItemList, TwoColumnPage } from "../../components";
import { useAdmin } from "../../tauri/admin";

export const TopicsPage = () => {
  const { clusterId, activeTopicName, setActiveTopicName } = useTopic();
  const { listTopics } = useAdmin();
  const { isFetching, isLoading, data, refetch } = useQuery(["listTopics", clusterId], () => listTopics(clusterId));

  const { favorites, toggleFavorite } = useFavorites(clusterId, "topics");
  const [addTopicModalOpened, setAddTopicModalOpened] = useState(false);
  const onTopicDeleted = (name: string) => {
    if (activeTopicName == name) {
      setActiveTopicName(undefined);
    }
    refetch();
  };

  return (
    <TwoColumnPage
      title="Topics"
      left={
        <>
          <ItemList
            title="Topics"
            listId={`topic-${clusterId}`}
            isLoading={isLoading}
            favorites={favorites}
            onFavToggled={toggleFavorite}
            isBackgroundRefreshing={isFetching}
            items={data ?? []}
            onItemSelected={setActiveTopicName}
            onRefreshList={refetch}
            onAddClick={() => setAddTopicModalOpened(true)}
          />
          <Modal
            closeOnEscape={false}
            closeOnClickOutside={false}
            opened={addTopicModalOpened}
            onClose={() => setAddTopicModalOpened(false)}
            title={<Title order={3}>Consumer settings</Title>}>
            <CreateTopicModal
              clusterId={clusterId}
              onClose={() => {
                setAddTopicModalOpened(false);
                refetch();
              }}
            />
          </Modal>
        </>
      }
      right={
        activeTopicName && <Topic clusterId={clusterId} topicName={activeTopicName} onTopicDeleted={onTopicDeleted} />
      }
    />
  );
};

const useTopic = () => {
  const { clusterId, topicName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `topic-main-${clusterId}`,
    defaultValue: { topicName },
  });

  if (!clusterId) {
    throw Error("Invalid path. Missing clusterId.");
  }

  return {
    clusterId,
    activeTopicName: state.topicName,
    setActiveTopicName: (name: string | undefined) => setState({ topicName: name }),
  };
};
