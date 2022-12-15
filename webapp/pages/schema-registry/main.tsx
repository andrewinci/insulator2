import { Center, Text } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { Allotment } from "allotment";
import { useParams } from "react-router-dom";
import { useUserSettings } from "../../providers";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const { clusterId, schemaName: navSchemaName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `schema-main-${clusterId}`,
    defaultValue: {
      schemaName: navSchemaName,
    },
  });
  const { userSettings: appState } = useUserSettings();
  const schemaRegistry = appState.clusters.find((c) => c.id == clusterId)?.schemaRegistry;

  if (schemaRegistry && schemaRegistry.endpoint && clusterId) {
    // a schema has been selected, show the allotment
    return (
      <Allotment>
        <Allotment.Pane minSize={430} preferredSize={state.schemaName ? 600 : undefined}>
          <SchemaList clusterId={clusterId} onSubjectSelected={(schemaName) => setState({ schemaName })} />
        </Allotment.Pane>

        <Allotment.Pane minSize={520}>
          {state.schemaName && <Schema clusterId={clusterId} schemaName={state.schemaName} />}
        </Allotment.Pane>
      </Allotment>
    );
  } else
    return (
      <Center mt={20}>
        <Text>Missing schema registry configuration</Text>
      </Center>
    );
};
