import { invoke } from "@tauri-apps/api";
import { useMemo, useState } from "react";
import { SchemaRegistry } from "../../models/kafka";
import { notifyAlert, notifySuccess } from "../../providers";
import { format, TauriError } from "../../tauri";
import { ItemList } from "../common";

function getSchemaNamesList(config: SchemaRegistry): Promise<string[]> {
  return invoke<string[]>("list_subjects", { config });
}

type SchemaListProps = {
  schemaRegistry: SchemaRegistry;
  onTopicSelected: (topicName: string) => void;
};

export const SchemaList = (props: SchemaListProps) => {
  const { schemaRegistry, onTopicSelected } = props;
  const [state, setState] = useState<{ schemas: string[]; search?: string; loading: boolean }>({
    schemas: [],
    loading: true,
  });

  const updateSchemasList = () => {
    setState({ ...state, loading: true });
    getSchemaNamesList(schemaRegistry)
      .then((schemas) => setState({ schemas, loading: false }))
      .then((_) => notifySuccess("List of schemas successfully retrieved"))
      .catch((err: TauriError) => {
        notifyAlert(`Unable to retrieve the list of schemas.`, format(err));
        setState({ schemas: [], loading: false });
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => updateSchemasList(), [schemaRegistry]);

  return (
    <ItemList
      title="Schemas"
      loading={state.loading}
      items={state.schemas}
      onItemSelected={onTopicSelected}
      onRefreshList={updateSchemasList}
    />
  );
};
