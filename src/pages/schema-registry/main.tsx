import { Text } from "@mantine/core";
import { Allotment } from "allotment";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../providers";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const { appState } = useAppState();
  const { clusterId, schemaName } = useParams();
  const navigate = useNavigate();
  const schemaRegistry = useMemo(
    () => appState.clusters.find((c) => c.id == clusterId)?.schemaRegistry,
    [appState, clusterId]
  );
  if (schemaRegistry && schemaRegistry.endpoint) {
    return (
      <Allotment>
        <Allotment.Pane minSize={300} maxSize={schemaName ? 1000 : undefined}>
          <SchemaList
            schemaRegistry={schemaRegistry}
            onTopicSelected={(activeSchema) =>
              navigate(`/cluster/${clusterId}/schema/${activeSchema}`)
            }
          />
        </Allotment.Pane>
        {schemaName && (
          <Allotment.Pane minSize={300}>
            <Schema schemaRegistry={schemaRegistry} schemaName={schemaName} />
          </Allotment.Pane>
        )}
      </Allotment>
    );
  } else return <Text>Missing schema registry configuration</Text>;
};
