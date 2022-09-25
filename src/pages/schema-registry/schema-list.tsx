import { invoke } from "@tauri-apps/api";
import { useMemo, useState } from "react";
import { SchemaRegistry } from "../../models/kafka";
import { useNotifications } from "../../providers";
import { format, TauriError } from "../../tauri";
import { ItemList } from "../common";

function getSchemaNamesList(config: SchemaRegistry): Promise<string[]> {
  return invoke<string[]>("list_subjects", { config });
}

type SchemaListProps = {
  schemaRegistry: SchemaRegistry;
  width?: number;
  onTopicSelected: (topicName: string) => void;
};

export const SchemaList = (props: SchemaListProps) => {
  const { schemaRegistry, width, onTopicSelected } = props;
  const { alert, success } = useNotifications();
  const [state, setState] = useState<{ schemas: string[]; search?: string; loading: boolean }>({
    schemas: [],
    loading: true,
  });

  const updateSchemasList = () => {
    setState({ ...state, loading: true });
    getSchemaNamesList(schemaRegistry)
      .then((schemas) => setState({ schemas, loading: false }))
      .then((_) => success("List of schemas successfully retrieved"))
      .catch((err: TauriError) => {
        alert(`Unable to retrieve the list of schemas.`, format(err));
        setState({ schemas: [], loading: false });
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateSchemasList(), [schemaRegistry]);

  return (
    <ItemList
      title="Schemas"
      width={width}
      loading={state.loading}
      items={state.schemas}
      onItemSelected={onTopicSelected}
      onRefreshList={updateSchemasList}
    />
  );
};
