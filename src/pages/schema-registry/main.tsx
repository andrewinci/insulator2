import { Center, Text } from "@mantine/core";
import { Allotment } from "allotment";
import { useNavigate, useParams } from "react-router-dom";
import { useUserSettings } from "../../providers";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const { clusterId, schemaName } = useParams();
  const { userSettings: appState } = useUserSettings();
  const schemaRegistry = appState.clusters.find((c) => c.id == clusterId)?.schemaRegistry;
  const navigate = useNavigate();

  if (schemaRegistry && schemaRegistry.endpoint && clusterId) {
    const schemaList = (
      <SchemaList
        clusterId={clusterId}
        onSubjectSelected={(activeSchema) => navigate(`/cluster/${clusterId}/schema/${activeSchema}`)}
      />
    );
    if (schemaName) {
      // a schema has been selected, show the allotment
      return (
        <Allotment>
          <Allotment.Pane minSize={430} maxSize={schemaName ? 600 : undefined} preferredSize={"100%"}>
            {schemaList}
          </Allotment.Pane>

          <Allotment.Pane minSize={300}>
            <Schema clusterId={clusterId} schemaName={schemaName} />
          </Allotment.Pane>
        </Allotment>
      );
    } else {
      // if no schema has been selected only show the schema list
      return schemaList;
    }
  } else
    return (
      <Center mt={20}>
        <Text>Missing schema registry configuration</Text>
      </Center>
    );
};
