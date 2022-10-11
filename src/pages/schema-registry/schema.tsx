import styled from "@emotion/styled";
import { ActionIcon, Center, Container, Divider, Group, Loader, ScrollArea, Select, Tooltip } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconInfoCircle, IconVersions } from "@tabler/icons";
import { useEffect, useState } from "react";
import { SingleLineTitle } from "../../components";
import { SchemaVersion } from "../../models/kafka";
import { getSchemaVersions } from "../../tauri";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
};

export const Schema = ({ schemaName, clusterId }: SchemaProps) => {
  const [state, setState] = useState<{
    schemas: SchemaVersion[];
    version?: number;
    loading: boolean;
  }>({ schemas: [], loading: true });

  const lastSchemaVersion = (schemas: SchemaVersion[]) => Math.max(...schemas.map((s) => s.version));

  useEffect(() => {
    setState({ ...state, loading: true });
    const update = async () => {
      const schemas = (await getSchemaVersions(clusterId, schemaName)) ?? [];
      setState({ schemas, version: lastSchemaVersion(schemas), loading: false });
    };
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaName, clusterId]);

  const getCurrentSchema = () => {
    if (state.schemas.length > 0) {
      const version = state.version ?? lastSchemaVersion(state.schemas);
      const currentSchema = state.schemas.find((s) => s.version == version)?.schema;
      return currentSchema ? JSON.stringify(JSON.parse(currentSchema), null, 2) : null;
    }
    return null;
  };

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <SingleLineTitle>{schemaName}</SingleLineTitle>
        <Tooltip position="bottom" label="Schema info">
          <ActionIcon>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider my={10} />
      <Group hidden={state.loading}>
        <Tooltip position="right" label="Schema version">
          <Select
            icon={<IconVersions />}
            data={state.schemas.map((s) => s.version.toString())}
            value={state.version?.toString()}
            onChange={(v) => v && setState({ ...state, version: +v })}
          />
        </Tooltip>
      </Group>
      <ScrollArea mt={20}>
        <Center hidden={!state.loading} mt={10}>
          <Loader />
        </Center>
        <CustomPrism hidden={state.loading} style={{ height: "calc(100vh - 155px)" }} language="json">
          {getCurrentSchema() ?? ""}
        </CustomPrism>
      </ScrollArea>
    </Container>
  );
};

const CustomPrism = styled(Prism)`
  code[class*="language-"],
  pre[class*="language-"] {
    white-space: pre-wrap !important;
    word-break: normal !important;
  }
`;
