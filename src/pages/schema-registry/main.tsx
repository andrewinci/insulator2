import { Group, Text } from "@mantine/core";
import { useState } from "react";
import { useAppState } from "../../providers";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const { appState } = useAppState();
  const [state, setState] = useState<{ activeSchema?: string }>({});
  const { activeSchema } = state;
  const schemaRegistry = appState.activeCluster?.schemaRegistry;
  if (schemaRegistry && schemaRegistry.endpoint) {
    return (
      <Group grow={true} align={"stretch"} position={"center"} noWrap={true}>
        <SchemaList
          schemaRegistry={schemaRegistry}
          onTopicSelected={(activeSchema) => {
            setState({ ...state, activeSchema: activeSchema });
          }}
        />
        {activeSchema && <Schema schemaRegistry={schemaRegistry} schemaName={activeSchema} />}
      </Group>
    );
  } else return <Text>Missing schema registry configuration</Text>;
};
