import { Group } from "@mantine/core";
import { useState } from "react";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const [state, setState] = useState<{ activeSchema?: string }>({});
  const { activeSchema } = state;
  return (
    <Group grow={true} align={"stretch"} position={"center"} noWrap={true}>
      <SchemaList
        onTopicSelected={(activeSchema) => {
          setState({ ...state, activeSchema: activeSchema });
        }}
      />
      {activeSchema && <Schema schemaName={activeSchema} />}
    </Group>
  );
};
