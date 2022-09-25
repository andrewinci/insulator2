import { Text } from "@mantine/core";
import { Allotment } from "allotment";
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
      <Allotment>
        <Allotment.Pane minSize={300} maxSize={activeSchema ? 500 : undefined}>
          <SchemaList
            schemaRegistry={schemaRegistry}
            onTopicSelected={(activeSchema) => {
              setState({ ...state, activeSchema });
            }}
          />
        </Allotment.Pane>
        {activeSchema && (
          <Allotment.Pane minSize={300}>
            <Schema schemaRegistry={schemaRegistry} schemaName={activeSchema} />
          </Allotment.Pane>
        )}
      </Allotment>
    );
  } else return <Text>Missing schema registry configuration</Text>;
};
