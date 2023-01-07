import { ActionIcon, Menu, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconFileExport, IconTool, IconTrash } from "@tabler/icons";
import { fs } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";
import { useNotifications } from "../../providers";
import { deleteSubject, deleteSubjectVersion } from "../../tauri/schema-registry";

type ToolsMenuProps = {
  clusterId: string;
  subject: string;
  version: number;
  currentSchema: string;
  onSubjectDeleted: (schemaName: string) => void;
  onVersionDeleted: () => void;
};

export const ToolsMenu = (props: ToolsMenuProps) => {
  const { clusterId, subject, version, currentSchema } = props;
  const { onSubjectDeleted, onVersionDeleted } = props;
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
          onSubjectDeleted(subject);
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
          onVersionDeleted();
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
