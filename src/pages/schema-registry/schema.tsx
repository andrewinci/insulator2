import styled from "@emotion/styled";
import { ActionIcon, Center, Container, Divider, Group, Loader, ScrollArea, Select, Tooltip } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { IconInfoCircle, IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHeader } from "../../components";
import { getSubject } from "../../tauri/schema-registry";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
};

const pretty = (j: string) => (j ? JSON.stringify(JSON.parse(j), null, 2) : "");

export const Schema = ({ schemaName, clusterId }: SchemaProps) => {
  const { data: subject, isLoading } = useQuery(["getSchemaVersions", clusterId, schemaName], () =>
    getSubject(clusterId, schemaName)
  );
  const [state, setState] = useState<{ version?: number }>();

  useMemo(() => {
    if (subject) {
      const lastSchemaVersion = Math.max(...subject.versions.map((s) => s.version));
      setState({ version: lastSchemaVersion });
    }
  }, [subject]);

  return (
    <Container>
      <Group noWrap style={{ maxHeight: 50 }} position={"apart"}>
        <PageHeader title={schemaName} subtitle={`Compatibility level: ${subject?.compatibility}`} />
        <Tooltip position="bottom" label="Schema info">
          <ActionIcon>
            <IconInfoCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider my={10} />
      {!isLoading && subject && (
        <Group>
          <Tooltip position="right" label="Schema version">
            <Select
              icon={<IconVersions />}
              data={subject.versions.map((s) => ({ value: s.version.toString(), label: `v${s.version} - ${s.id}` }))}
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
          {pretty(subject?.versions?.find((s) => s.version == state?.version)?.schema ?? "")}
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
