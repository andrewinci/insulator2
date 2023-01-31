import { useSessionStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { TwoColumnPage } from "../common";
import { ConsumerGroup } from "./consumer-group";
import { Modal, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useFavorites } from "../../hooks/use-favorites";
import { getConsumerGroups } from "../../tauri/admin";
import { ItemList } from "../common";
import { UpsertConsumerGroupModal } from "./upsert-consumer-group-modal";

export const ConsumerGroupsPage = () => {
  const { clusterId, activeConsumerGroupName, setActiveConsumerGroupName } = useConsumerGroup();

  const [addCGModalOpened, setAddCGModalOpened] = useState(false);

  const { isLoading, isFetching, data, refetch } = useQuery(["getConsumerGroups", clusterId], () =>
    getConsumerGroups(clusterId)
  );
  const { favorites, toggleFavorite } = useFavorites(clusterId, "consumers");

  const onDeleteConsumerGroup = (name: string) => {
    if (name == activeConsumerGroupName) {
      setActiveConsumerGroupName(undefined);
    }
    refetch();
  };

  return (
    <TwoColumnPage
      title="Consumer groups"
      left={
        <>
          <ItemList
            title="Consumers"
            listId={`consumer-groups-${clusterId}`}
            onAddClick={() => setAddCGModalOpened(true)}
            isBackgroundRefreshing={isFetching}
            isLoading={isLoading}
            favorites={favorites}
            onFavToggled={toggleFavorite}
            items={data ?? []}
            onItemSelected={setActiveConsumerGroupName}
            onRefreshList={refetch}
          />
          <Modal
            closeOnEscape={false}
            closeOnClickOutside={false}
            opened={addCGModalOpened}
            onClose={() => setAddCGModalOpened(false)}
            title={<Title order={3}>Create consumer group</Title>}>
            <UpsertConsumerGroupModal
              clusterId={clusterId}
              onClose={() => {
                setAddCGModalOpened(false);
                refetch();
              }}
            />
          </Modal>
        </>
      }
      right={
        activeConsumerGroupName && (
          <ConsumerGroup
            name={activeConsumerGroupName}
            clusterId={clusterId}
            onDeleteConsumerGroup={onDeleteConsumerGroup}
          />
        )
      }
    />
  );
};

export const useConsumerGroup = () => {
  const { clusterId, consumerName: navConsumerName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `consumer-main-${clusterId}`,
    defaultValue: {
      consumerName: navConsumerName,
    },
  });

  if (!clusterId) {
    throw Error("Invalid path. Missing clusterId.");
  }

  return {
    clusterId,
    activeConsumerGroupName: state.consumerName,
    setActiveConsumerGroupName: (name: string | undefined) => setState({ consumerName: name }),
  };
};
