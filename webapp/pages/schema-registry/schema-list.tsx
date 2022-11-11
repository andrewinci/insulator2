import { listSubjects } from "../../tauri/schema-registry";
import { ItemList } from "../common";
import { useQuery } from "@tanstack/react-query";
import { AddSchemaModal } from "./add-schema";
import { Modal, Title } from "@mantine/core";
import { useSetState } from "@mantine/hooks";

type SchemaListProps = {
  clusterId: string;
  onSubjectSelected: (subject: string) => void;
};

export const SchemaList = (props: SchemaListProps) => {
  const { clusterId, onSubjectSelected } = props;
  const {
    data: subjects,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(["getSchemaNamesList", clusterId], () => listSubjects(clusterId));
  const [state, setState] = useSetState({ modalOpened: false });

  return (
    <>
      <ItemList
        title="Schemas"
        listId={`schemas-${clusterId}`}
        isLoading={isLoading}
        isFetching={isFetching}
        items={subjects ?? []}
        onAddClick={() => setState((s) => ({ ...s, modalOpened: !s.modalOpened }))}
        onItemSelected={onSubjectSelected}
        onRefreshList={refetch}
      />
      <Modal
        size="lg"
        title={<Title>Add a new schema</Title>}
        opened={state.modalOpened}
        onClose={() => setState((s) => ({ ...s, modalOpened: false }))}
        closeOnEscape={false}
        closeOnClickOutside={false}>
        <AddSchemaModal
          onClose={() => refetch().then((_) => setState((s) => ({ ...s, modalOpened: false })))}
          clusterId={clusterId}
          subjects={subjects ?? []}
        />
      </Modal>
    </>
  );
};
