import { Center, Text } from "@mantine/core";
import { Allotment } from "allotment";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentCluster } from "../../providers";
import { Schema } from "./schema";
import { SchemaList } from "./schema-list";

export const SchemasPage = () => {
  const { clusterId, schemaName } = useParams();
  const schemaRegistry = useCurrentCluster()?.schemaRegistry;
  const navigate = useNavigate();
  if (schemaRegistry && schemaRegistry.endpoint) {
    return (
      <Allotment>
        <Allotment.Pane minSize={430} maxSize={schemaName ? 600 : undefined}>
          <SchemaList
            clusterId={clusterId!}
            onSubjectSelected={(activeSchema) => navigate(`/cluster/${clusterId}/schema/${activeSchema}`)}
          />
        </Allotment.Pane>
        {schemaName && (
          <Allotment.Pane minSize={300}>
            <Schema clusterId={clusterId!} schemaName={schemaName} />
          </Allotment.Pane>
        )}
      </Allotment>
    );
  } else
    return (
      <Center mt={20}>
        <Text>Missing schema registry configuration</Text>
      </Center>
    );
};
