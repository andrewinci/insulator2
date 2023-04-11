import { Text, Loader, Menu, ActionIcon, Modal } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconAdjustments, IconFlag, IconPlayerPlay, IconRefresh, IconTool, IconTrash } from "@tabler/icons";
import { useState } from "react";
import { ConsumerOffsetConfiguration, ConsumerGroupInfo } from "../../models";
import { deleteConsumerGroup, useAdmin } from "../../tauri/admin";
import { UpsertConsumerGroupModal } from "./upsert-consumer-group-modal";

type ToolsMenuProps = {
  loading: boolean;
  disabled: boolean;
  clusterId: string;
  data: ConsumerGroupInfo;
  onRefresh: () => void;
  onDeleteConsumerGroup: (name: string) => void;
};

export const ToolsMenu = (props: ToolsMenuProps) => {
  const { clusterId, loading, disabled, data, onRefresh, onDeleteConsumerGroup } = props;
  const { setConsumerGroup } = useAdmin();
  const topics = [...new Set(data.offsets.map((o) => o.topic))];

  const [isResetting, setIsResetting] = useState(false);
  const resetOffset = async (offset: ConsumerOffsetConfiguration) => {
    try {
      setIsResetting(true);
      await setConsumerGroup(clusterId, data.name, topics, offset);
      onRefresh();
    } finally {
      setIsResetting(false);
    }
  };

  const showResetOffsetModal = (offset: ConsumerOffsetConfiguration) => {
    openConfirmModal({
      title: "Reset consumer group to the beginning",
      children: (
        <>
          <Text size="sm">
            {`Are you sure to reset the offset of ALL topics in the consumer group ${data.name} to the ${offset}?`}
          </Text>
          <Text my={10} size="sm" color={"red"}>
            This action is irreversible.
          </Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      closeOnEscape: false,
      closeOnClickOutside: false,
      onConfirm: async () => await resetOffset(offset),
    });
  };

  const openDeleteGroupModal = () =>
    openConfirmModal({
      title: "Are you sure to delete this consumer group?",
      children: (
        <>
          <Text color="red" size="sm">
            The consumer group {data.name} will be deleted. This action is not reversible!
          </Text>
          <Text size="sm">Note: this operation may fail if the ACLs do not allow the deletion.</Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        await deleteConsumerGroup(clusterId, data.name);
        onDeleteConsumerGroup(data.name);
      },
    });

  const [customOffsetModal, setCustomOffsetModal] = useState({ opened: false });
  const openCustomOffsetModal = () => {
    setCustomOffsetModal((s) => ({ ...s, opened: true }));
  };

  return (
    <>
      <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
        <Menu.Target>
          <ActionIcon size={28} sx={{ marginRight: "10px" }}>
            {isResetting || loading || disabled ? <Loader /> : <IconTool />}
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Tools</Menu.Label>
          <Menu.Item icon={<IconRefresh size={14} />} onClick={() => onRefresh()} disabled={loading || disabled}>
            Refresh
          </Menu.Item>
          <Menu.Label>Reset offset</Menu.Label>
          <Menu.Item
            color={"orange"}
            onClick={() => showResetOffsetModal("Beginning")}
            icon={<IconPlayerPlay size={14} />}>
            Reset to the beginning
          </Menu.Item>
          <Menu.Item color={"orange"} onClick={() => showResetOffsetModal("End")} icon={<IconFlag size={14} />}>
            Reset to end
          </Menu.Item>
          <Menu.Item color={"orange"} onClick={() => openCustomOffsetModal()} icon={<IconAdjustments size={14} />}>
            Custom
          </Menu.Item>
          <Menu.Label>Danger zone</Menu.Label>
          <Menu.Item color={"red"} icon={<IconTrash size={14} />} onClick={() => openDeleteGroupModal()}>
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Modal
        title="Reset consumer group offset"
        opened={customOffsetModal.opened}
        onClose={() => setCustomOffsetModal((s) => ({ ...s, opened: false }))}>
        <UpsertConsumerGroupModal
          showWarning
          readonlyName
          name={data.name}
          clusterId={clusterId}
          onClose={() => {
            setCustomOffsetModal((s) => ({ ...s, opened: false }));
            onRefresh();
          }}
          topics={topics}
        />
      </Modal>
    </>
  );
};
