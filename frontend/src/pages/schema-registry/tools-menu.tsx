import { ActionIcon, Button, Group, Menu, Select, Stack, Text } from "@mantine/core";
import { closeModal, openConfirmModal, openModal } from "@mantine/modals";
import { IconFileExport, IconGitCommit, IconRefresh, IconTool, IconTrash } from "@tabler/icons";

import { deleteSubject, deleteSubjectVersion, setCompatibilityLevel } from "../../tauri/schema-registry";
import { saveTextFile } from "../../tauri/helpers";
import { useState } from "react";

type ToolsMenuProps = {
  clusterId: string;
  subject: string;
  version: number;
  currentSchema: string;
  compatibility: string;
  onSubjectDeleted: (schemaName: string) => void;
  onSubjectUpdated: (subjectName: string) => void;
};

export const ToolsMenu = (props: ToolsMenuProps) => {
  const { clusterId, subject, version, currentSchema, compatibility } = props;
  const { onSubjectDeleted, onSubjectUpdated } = props;
  const openDeleteSubjectModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this subject?",
      children: (
        <Text color="red" size="sm">
          All versions of the {subject} schema will be deleted. This action is not reversible!
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        await deleteSubject(clusterId, subject);
        onSubjectDeleted(subject);
      },
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
          onSubjectUpdated(subject);
        }),
    });

  const onExport = () => saveTextFile(subject, currentSchema);

  const openUpdateCompatibilityModal = () => {
    const modalId = "schema_compatibility";
    openModal({
      modalId,
      title: `Update compatibility settings`,
      children: (
        <ChangeSchemaCompatibilityModal
          clusterId={clusterId}
          subject={subject}
          compatibility={compatibility}
          onClose={() => {
            closeModal(modalId);
            onSubjectUpdated(subject);
          }}
        />
      ),
    });
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
        <Menu.Item icon={<IconRefresh size={14} />} onClick={() => onSubjectUpdated(subject)}>
          Refresh
        </Menu.Item>
        <Menu.Item icon={<IconFileExport size={14} />} onClick={onExport}>
          Download schema
        </Menu.Item>
        <Menu.Item color="orange" icon={<IconGitCommit size={14} />} onClick={openUpdateCompatibilityModal}>
          Update compatibility
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

const ChangeSchemaCompatibilityModal = (props: {
  clusterId: string;
  subject: string;
  compatibility: string;
  onClose: () => void;
}) => {
  const { clusterId, subject, compatibility, onClose } = props;
  const [state, setState] = useState({ compatibility, loading: false });
  const onUpdate = () =>
    Promise.resolve(setState((s) => ({ ...s, loading: true })))
      .then((_) => setCompatibilityLevel(clusterId, subject, state.compatibility))
      .catch((err) => console.error(err))
      .then((_) => setState((s) => ({ ...s, loading: false })))
      .then((_) => onClose());

  return (
    <Stack spacing={3} style={{ height: "100%" }}>
      {compatibility !== state.compatibility && (
        <Text
          size={"sm"}
          color={"red"}>{`Update ${subject} compatibility level from ${compatibility} to ${state.compatibility}`}</Text>
      )}
      <Select
        allowDeselect={false}
        label={`Select the compatibility level`}
        value={state.compatibility}
        onChange={(c) => setState((s) => ({ ...s, compatibility: c ?? "NONE" }))}
        data={["BACKWARD", "BACKWARD_TRANSITIVE", "FORWARD", "FORWARD_TRANSITIVE", "FULL", "FULL_TRANSITIVE", "NONE"]}
      />
      <Group mt={"1em"} position="right">
        <Button size="sm" loading={state.loading} disabled={compatibility === state.compatibility} onClick={onUpdate}>
          Update
        </Button>
      </Group>
    </Stack>
  );
};
