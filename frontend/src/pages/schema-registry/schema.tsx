import { Center, Container, Group, Loader, Select, Tooltip } from "@mantine/core";
import { IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CodeEditor, NewWindowButton, PageHeader } from "../../components";
import { pretty } from "../../helpers/json";
import { getSubject } from "../../tauri/schema-registry";
import { ToolsMenu } from "./tools-menu";

type SchemaProps = {
  schemaName: string;
  clusterId: string;
  onSubjectDeleted?: (schemaName: string) => void;
};

export const Schema = ({ schemaName, clusterId, onSubjectDeleted }: SchemaProps & JSX.IntrinsicAttributes) => {
  const {
    data: subject,
    isLoading,
    refetch,
  } = useQuery(["getSchemaVersions", clusterId, schemaName], () => getSubject(clusterId, schemaName));

  const [state, setState] = useState({
    version: undefined as number | undefined,
  });

  useMemo(() => {
    if (subject) {
      const lastSchemaVersion = Math.max(...subject.versions.map((s) => s.version));
      setState((s) => ({ ...s, version: lastSchemaVersion }));
    }
  }, [subject]);

  const currentSchema = pretty(subject?.versions?.find((s) => s.version == state?.version)?.schema ?? "");

  return (
    <Container fluid>
      <PageHeader title={schemaName} subtitle={`Compatibility level: ${subject?.compatibility}`}>
        <Group spacing={0}>
          {state?.version && (
            <ToolsMenu
              clusterId={clusterId}
              subject={schemaName}
              version={state.version}
              currentSchema={currentSchema}
              onSubjectDeleted={
                onSubjectDeleted ??
                ((v) => {
                  console.log(v);
                })
              }
              onVersionDeleted={() => refetch()}
            />
          )}
          <NewWindowButton
            url={`/modal/cluster/${clusterId}/schema/${schemaName}`}
            windowTitle={`Schema ${schemaName}`}
          />
        </Group>
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

      <Container fluid mt={20} p={0} ml={0}>
        <Center hidden={!isLoading} mt={10}>
          <Loader />
        </Center>
        <CodeEditor
          path={schemaName}
          height="calc(100vh - 155px)"
          language="json"
          value={currentSchema}
          readOnly={true}
        />
      </Container>
    </Container>
  );
};
