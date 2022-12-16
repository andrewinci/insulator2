import { ActionIcon, Center, Container, Group, Loader, Menu, Select, Tooltip, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconFileExport, IconTool, IconTrash, IconVersions } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { fs } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";
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
        {state?.version && (
          <Tools clusterId={clusterId} subject={schemaName} version={state.version} currentSchema={currentSchema} />
        )}
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

const Tools = ({
  clusterId,
  subject,
  version,
  currentSchema,
}: {
  clusterId: string;
  subject: string;
  version: number;
  currentSchema: string;
}) => {
  const navigate = useNavigate();
  const { success, alert } = useNotifications();
  const openDeleteSubjectModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this subject?",
      children: (
        <Text color="red" size="sm">
          All versions of the {subject} schema will be deleted. This action is not reversible!
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

  const onExport = async () => {
    const path = await save({
      defaultPath: `${subject}.json`,
    });
    if (path) {
      try {
        await fs.writeTextFile(path, currentSchema);
        success(`Schema saved to ${path}`);
      } catch (err) {
        alert("Unable to save the schema locally", JSON.stringify(err));
      }
    }
  };

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          <IconTool />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item icon={<IconFileExport size={14} />} onClick={onExport}>
          Download schema
        </Menu.Item>
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
