import { useQuery } from "@tanstack/react-query";
import { getConsumerGroups } from "../../tauri/admin";
import { ItemList } from "../common";

type SchemaListProps = {
  clusterId: string;
  onConsumerSelected: (consumerName: string) => void;
};

export const ConsumerGroupsList = (props: SchemaListProps) => {
  const { clusterId, onConsumerSelected } = props;
  const { isLoading, isFetching, data, refetch } = useQuery(["getConsumerGroups", clusterId], () =>
    getConsumerGroups(clusterId)
  );

  return (
    <ItemList
      title="Consumers"
      listId={`consumer-groups-${clusterId}`}
      isFetching={isFetching}
      isLoading={isLoading}
      items={data ?? []}
      onItemSelected={onConsumerSelected}
      onRefreshList={refetch}
    />
  );
};
