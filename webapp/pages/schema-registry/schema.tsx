import { ActionIcon, Center, Container, Group, Loader, Menu, Select, Tooltip, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconTool, IconTrash, IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CodeEditor, PageHeader } from "../../components";
import { pretty } from "../../helpers/json";
import { useNotifications } from "../../providers";
import { deleteSubject, deleteSubjectVersion, getSubject } from "../../tauri/schema-registry";

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
        {state?.version && <Tools clusterId={clusterId} subject={schemaName} version={state.version} />}
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

const Tools = ({ clusterId, subject, version }: { clusterId: string; subject: string; version: number }) => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const openDeleteSubjectModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this subject?",
      children: (
        <Text color="red" size="sm">
          All versions of this {subject} will be deleted. This action is not reversible!
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () =>
        await deleteSubject(clusterId, subject).then((_) => {
          success("Schema deleted successfully");
          navigate(`/cluster/${clusterId}/schemas`);
        }),
    });

  const openDeleteVersionModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this version of the schema?",
      children: (
        <Text color="red" size="sm">
          The version {version} of {subject} will be deleted. This action is not reversible!
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () =>
        await deleteSubjectVersion(clusterId, subject, version).then((_) => {
          success(`Schema version ${version} deleted successfully`);
          navigate(`/cluster/${clusterId}/schemas`);
        }),
    });

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          <IconTool />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteVersionModal}>
          Delete selected version
        </Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteSubjectModal}>
          Delete subject
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
