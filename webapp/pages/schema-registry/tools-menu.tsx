import { ActionIcon, Menu, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconTool, IconTrash } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../providers";
import { deleteSubject, deleteSubjectVersion } from "@tauri/schema-registry";

export const ToolsMenu = ({ clusterId, subject, version }: { clusterId: string; subject: string; version: number }) => {
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
