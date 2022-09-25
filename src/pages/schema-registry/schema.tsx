import { ActionIcon, Container, Divider, Group, Title, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";
import { invoke } from "@tauri-apps/api";
import { useMemo } from "react";
import { SchemaRegistry } from "../../models/kafka";

const getLatestSchema = (subjectName: string, config: SchemaRegistry) =>
  invoke("get_schema", { subjectName, config }).catch((err) => console.error(err));

export const Schema = ({
  schemaName,
  schemaRegistry,
}: {
  schemaName: string;
  schemaRegistry: SchemaRegistry;
}) => {
  useMemo(async () => {
    const lastSchema = await getLatestSchema(schemaName, schemaRegistry);
    console.log(lastSchema);
  }, [schemaName]);
  return (
    <Container style={{ width: "100%" }}>
      <Group position={"apart"}>
        <Title>{schemaName}</Title>
        <Group>
          <Tooltip label="Topic info">
            <ActionIcon>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider mt={10} />
    </Container>
  );
};
