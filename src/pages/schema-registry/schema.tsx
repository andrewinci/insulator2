import { Container, Divider, Group, ScrollArea, Select, Title, Tooltip } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconVersions } from "@tabler/icons";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { SchemaRegistry } from "../../models/kafka";
import { notifyAlert, notifySuccess } from "../../providers";
import { TauriError, format } from "../../tauri";

type SchemaVersion = {
  subject: string;
  id: number;
  version: number;
  schema: string;
};

const getSchemaVersions = (subjectName: string, config: SchemaRegistry) =>
  invoke<[SchemaVersion]>("get_schema", { subjectName, config })
    .then((res) => {
      notifySuccess(`${res.length} schema version found for ${subjectName}`);
      return res;
    })
    .catch((err: TauriError) => notifyAlert(format(err)));

export const Schema = ({
  schemaName,
  schemaRegistry,
}: {
  schemaName: string;
  schemaRegistry: SchemaRegistry;
}) => {
  const [state, setState] = useState<{
    schemas: SchemaVersion[];
    version?: number;
  }>({ schemas: [] });

  const lastSchemaVersion = (schemas: SchemaVersion[]) =>
    Math.max(...schemas.map((s) => s.version));

  useEffect(() => {
    const update = async () => {
      const schemas = (await getSchemaVersions(schemaName, schemaRegistry)) ?? [];
      setState({ schemas, version: lastSchemaVersion(schemas) });
    };
    update();
  }, [schemaName, schemaRegistry]);

  const getCurrentSchema = () => {
    if (state.schemas.length > 0) {
      const version = state.version ?? lastSchemaVersion(state.schemas);
      const currentSchema = state.schemas.find((s) => s.version == version)?.schema;
      return currentSchema ? JSON.stringify(JSON.parse(currentSchema), null, 2) : null;
    }
    return null;
  };

  return (
    <Container style={{ width: "100%" }}>
      <Group position={"apart"}>
        <Title>{schemaName}</Title>
        <Group>
          {/* todo: <Tooltip position="left" label="Schema info">
            <ActionIcon>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip> */}
        </Group>
      </Group>
      <Divider my={10} />
      <Group>
        <Tooltip position="right" label="Schema version">
          <Select
            icon={<IconVersions />}
            data={state.schemas.map((s) => s.version.toString())}
            value={state.version?.toString()}
            onChange={(v) => v && setState({ ...state, version: +v })}
          />
        </Tooltip>
      </Group>
      <ScrollArea mt={10}>
        <Prism style={{ height: "calc(100vh - 145px)" }} withLineNumbers language="json">
          {getCurrentSchema() ?? ""}
        </Prism>
      </ScrollArea>
    </Container>
  );
};
