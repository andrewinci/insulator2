import styled from "@emotion/styled";
import { ActionIcon, Center, Container, Divider, Group, Loader, ScrollArea, Select, Tooltip } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconInfoCircle, IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SingleLineTitle } from "../../components";
import { getSchemaVersions } from "../../tauri/schema-registry";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
};

const pretty = (j: string) => (j ? JSON.stringify(JSON.parse(j), null, 2) : "");

export const Schema = ({ schemaName, clusterId }: SchemaProps) => {
  const { data, isLoading } = useQuery(["getSchemaVersions", clusterId, schemaName], () =>
    getSchemaVersions(clusterId, schemaName)
  );
  const [state, setState] = useState<{ version?: number }>();

  useMemo(() => {
    if (data) {
      const lastSchemaVersion = Math.max(...data.map((s) => s.version));
      setState({ version: lastSchemaVersion });
    }
  }, [data]);

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
      {!isLoading && data && (
        <Group>
          <Tooltip position="right" label="Schema version">
            <Select
              icon={<IconVersions />}
              data={data.map((s) => s.version.toString())}
              value={state?.version?.toString()}
              onChange={(v) => v && setState({ ...state, version: +v })}
            />
          </Tooltip>
        </Group>
      )}
      <ScrollArea mt={20}>
        <Center hidden={!isLoading} mt={10}>
          <Loader />
        </Center>
        <CustomPrism hidden={isLoading} style={{ height: "calc(100vh - 155px)" }} language="json">
          {pretty(data?.find((s) => s.version == state?.version)?.schema ?? "")}
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
