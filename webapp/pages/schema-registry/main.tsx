import { Center, Text } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { useUserSettings } from "../../providers";
import { TwoColumnPage } from "../common";
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
      <TwoColumnPage
        title="Schema registry"
        left={<SchemaList clusterId={clusterId} onSubjectSelected={(schemaName) => setState({ schemaName })} />}
        right={state.schemaName && <Schema clusterId={clusterId} schemaName={state.schemaName} />}
      />
    );
  } else
    return (
      <Center mt={20}>
        <Text>Missing schema registry configuration</Text>
      </Center>
    );
};
