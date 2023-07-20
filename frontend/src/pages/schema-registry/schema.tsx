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
  schemaId?: number;
  onSubjectDeleted?: (schemaName: string) => void;
};

export const Schema = ({
  schemaName,
  clusterId,
  schemaId,
  onSubjectDeleted,
}: SchemaProps & JSX.IntrinsicAttributes) => {
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
      // show the schema id from props if not null otherwise show the latest schema version
      const propSchemaId = subject.versions.find((v) => v.id == schemaId)?.version;
      const lastSchemaVersion = propSchemaId ?? Math.max(...subject.versions.map((s) => s.version));
      setState((s) => ({ ...s, version: lastSchemaVersion }));
    }
  }, [subject, schemaId]);

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
              compatibility={subject?.compatibility ?? "NONE"}
              currentSchema={currentSchema}
              onSubjectDeleted={(subject) => onSubjectDeleted?.(subject)}
              onSubjectUpdated={(_) => refetch()}
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
        <CodeEditor height="calc(100vh - 155px)" language="json" value={currentSchema} readOnly={true} />
      </Container>
    </Container>
  );
};
