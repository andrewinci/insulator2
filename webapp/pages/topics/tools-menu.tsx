import { ActionIcon, Menu, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { useNotifications } from "@providers";
import { IconInfoCircle, IconTool, IconTrash } from "@tabler/icons";
import { deleteTopic } from "@tauri/admin";
import { useNavigate } from "react-router-dom";

export const ToolsMenu = ({ clusterId, topic }: { clusterId: string; topic: string }) => {
  const navigate = useNavigate();
  const { success } = useNotifications();
  const openDeleteTopicModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this topic?",
      children: (
        <>
          <Text color="red" size="sm">
            The topic {topic} will be deleted. This action is not reversible!
          </Text>
          <Text size="sm">Note: this operation may fail if the ACLs do not allow the deletion.</Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () =>
        await deleteTopic(clusterId, topic).then((_) => {
          success(`Topic ${topic} deleted successfully`);
          navigate(`/cluster/${clusterId}/topics`);
        }),
    });

  const openInfoModal = () => console.log("Not implemented yet");

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          <IconTool />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item icon={<IconInfoCircle size={14} />} onClick={openInfoModal}>
          Topic info
        </Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={openDeleteTopicModal}>
          Delete topic
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
