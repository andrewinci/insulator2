import { useMemo, useState } from "react";
import { useNotifications } from "../../providers";
import { format, getSchemaNamesList, TauriError } from "../../tauri";
import { ItemList } from "../common";

type SchemaListProps = {
  clusterId: string;
  onSubjectSelected: (subject: string) => void;
};

export const SchemaList = (props: SchemaListProps) => {
  const { clusterId, onSubjectSelected: onTopicSelected } = props;
  const { alert, success } = useNotifications();
  const [state, setState] = useState<{ schemas: string[]; search?: string; loading: boolean }>({
    schemas: [],
    loading: true,
  });

  const updateSchemasList = () => {
    setState({ ...state, loading: true });
    getSchemaNamesList(clusterId)
      .then((schemas) => setState({ schemas, loading: false }))
      .then((_) => success("List of schemas successfully retrieved"))
      .catch((err: TauriError) => {
        alert(`Unable to retrieve the list of schemas.`, format(err));
        setState({ schemas: [], loading: false });
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateSchemasList(), [clusterId]);

  return (
    <ItemList
      title="Schemas"
      listId={`schemas-${clusterId}`}
      loading={state.loading}
      items={state.schemas}
      onItemSelected={onTopicSelected}
      onRefreshList={updateSchemasList}
    />
  );
};
