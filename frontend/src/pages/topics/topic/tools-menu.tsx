import { ActionIcon, Text, Menu, Title } from "@mantine/core";
import { IconFileExport, IconInfoCircle, IconTool, IconTrash } from "@tabler/icons";
import { deleteTopic, getTopicInfo } from "../../../tauri/admin";
import { openConfirmModal, openModal } from "@mantine/modals";
import { useNotifications } from "../../../providers";
import { TopicInfoModal } from "../modals/topic-info-modal";

type ToolsMenuProps = {
  clusterId: string;
  topic: string;
  exportInProgress: boolean;
  onExportClick: () => void;
  onTopicDeleted: (topicName: string) => void;
};

export const ToolsMenu = (props: ToolsMenuProps) => {
  const { clusterId, topic, exportInProgress, onExportClick, onTopicDeleted } = props;
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
          onTopicDeleted(topic);
        }),
    });

  const openInfoModal = async () => {
    const topicInfo = await getTopicInfo(clusterId, topic);
    return openModal({
      title: <Title>Topic info</Title>,
      size: 700,
      children: <TopicInfoModal topicInfo={topicInfo} />,
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
        <Menu.Item icon={<IconFileExport size={14} />} onClick={onExportClick} disabled={exportInProgress}>
          Export records
        </Menu.Item>
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
