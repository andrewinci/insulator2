import { Modal, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useFavorites } from "../../hooks/use-favorites";
import { getConsumerGroups } from "../../tauri/admin";
import { ItemList } from "../common";
import { CreateConsumerGroupModal } from "./create-consumer-group-modal";

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
        isBackgroundRefreshing={isFetching}
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
