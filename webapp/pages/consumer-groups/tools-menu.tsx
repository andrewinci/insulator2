import { ActionIcon, Loader, Menu, Text } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconFlag, IconPlayerPlay, IconRefresh, IconTool, IconTrash } from "@tabler/icons";
import { deleteConsumerGroup, setConsumerGroup } from "@tauri/admin";
import { useNavigate } from "react-router-dom";

import { ConsumerGroupInfo, ConsumerOffsetConfiguration } from "../../models";
import { useNotifications } from "../../providers";

export const ToolsMenu = (props: {
  loading: boolean;
  disabled: boolean;
  clusterId: string;
  data: ConsumerGroupInfo;
  refresh: () => void;
}) => {
  const { clusterId, loading, disabled, data, refresh } = props;
  const [state, setState] = useSetState<{ isResetting: boolean }>({ isResetting: false });
  const navigate = useNavigate();
  const { success } = useNotifications();

  const resetOffset = async (offset: ConsumerOffsetConfiguration) => {
    setState({ isResetting: true });
    try {
      await setConsumerGroup(
        clusterId,
        data.name,
        data.offsets.map((o) => o.topic),
        offset
      ).then((_) => {
        success("Consumer group updated successfully");
        refresh();
      });
    } finally {
      setState({ isResetting: false });
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
      onConfirm: async () =>
        await deleteConsumerGroup(clusterId, data.name).then((_) => {
          success(`Consumer group ${data.name} deleted successfully`);
          navigate(`/cluster/${clusterId}/consumers`);
        }),
    });

  return (
    <Menu position="bottom-end" trigger="hover" openDelay={100} closeDelay={400}>
      <Menu.Target>
        <ActionIcon size={28} sx={{ marginRight: "10px" }}>
          {state.isResetting || loading || disabled ? <Loader /> : <IconTool />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Tools</Menu.Label>
        <Menu.Item icon={<IconRefresh size={14} />} onClick={() => refresh()} disabled={loading || disabled}>
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
        {/* <Menu.Item icon={<IconClock size={14} />}>Reset to a point in time</Menu.Item> */}
        <Menu.Label>Danger</Menu.Label>
        <Menu.Item color={"red"} icon={<IconTrash size={14} />} onClick={() => openDeleteGroupModal()}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
