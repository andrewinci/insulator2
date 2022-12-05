import { Center, Container, Group, Loader, Select, Tooltip } from "@mantine/core";
import { IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CodeEditor, PageHeader } from "../../components";
import { pretty } from "../../helpers/json";
import { getSubject } from "../../tauri/schema-registry";
import { ToolsMenu } from "./tools-menu";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
};

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
      <PageHeader title={schemaName} subtitle={`Compatibility level: ${subject?.compatibility}`}>
        {state?.version && <ToolsMenu clusterId={clusterId} subject={schemaName} version={state.version} />}
      </PageHeader>
      {!isLoading && subject && (
        <Group>
          <Tooltip position="right" label="Schema version">
            <Select
              size="xs"
              icon={<IconVersions />}
              data={subject.versions.map((s) => ({ value: s.version.toString(), label: `v${s.version} - ${s.id}` }))}
              value={state?.version?.toString()}
              onChange={(v) => v && setState({ ...state, version: +v })}
            />
          </Tooltip>
        </Group>
      )}

      <Container mt={20} p={0} ml={0}>
        <Center hidden={!isLoading} mt={10}>
          <Loader />
        </Center>
        <CodeEditor
          path={schemaName}
          height="calc(100vh - 155px)"
          language="json"
          value={pretty(subject?.versions?.find((s) => s.version == state?.version)?.schema ?? "")}
          readOnly={true}
        />
      </Container>
    </Container>
  );
};
