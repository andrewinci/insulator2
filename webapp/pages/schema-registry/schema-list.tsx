import { listSubjects } from "../../tauri/schema-registry";
import { ItemList } from "../common";
import { useQuery } from "@tanstack/react-query";

type SchemaListProps = {
  clusterId: string;
  onSubjectSelected: (subject: string) => void;
};

export const SchemaList = (props: SchemaListProps) => {
  const { clusterId, onSubjectSelected } = props;
  const { data, isLoading, isFetching, refetch } = useQuery(["getSchemaNamesList", clusterId], () =>
    listSubjects(clusterId)
  );

  return (
    <ItemList
      title="Schemas"
      listId={`schemas-${clusterId}`}
      isLoading={isLoading}
      isFetching={isFetching}
      items={data ?? []}
      onItemSelected={onSubjectSelected}
      onRefreshList={refetch}
    />
  );
};
