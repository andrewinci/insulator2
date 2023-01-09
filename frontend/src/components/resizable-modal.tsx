import { ActionIcon, Group, Modal, Title } from "@mantine/core";
import { IconX } from "@tabler/icons";
import { NewWindowButton } from "./new-window-button";

type ResizableModalProps = {
  children: React.ReactNode;
  title: string;
  opened: boolean;
  minHeight?: number;
  maxHeight?: number | string;
  newWindowSettings?: {
    url: string;
    windowTitle: string;
    beforeOpen?: () => void;
  };
  onClose: () => void;
};

export const ResizableModal = (props: ResizableModalProps) => {
  const { children, title, opened, minHeight, maxHeight, newWindowSettings, onClose } = props;
  return (
    <Modal
      withCloseButton={false}
      onClose={onClose}
      opened={opened}
      closeOnClickOutside={false}
      styles={{
        modal: {
          minWidth: 600,
          minHeight: minHeight ?? 700,
          height: 700,
          maxHeight: maxHeight ?? "92vh",
          maxWidth: "92vw",
          position: "absolute",
          resize: "both",
          overflow: "auto",
        },
        body: {
          height: "calc(100% - 50px)",
        },
      }}>
      <>
        <Group mb={10} position="apart">
          <Title order={3}>{title}</Title>
          <Group spacing={2}>
            {newWindowSettings && <NewWindowButton {...newWindowSettings} afterOpen={onClose} />}
            <ActionIcon onClick={onClose}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>
        {children}
      </>
    </Modal>
  );
};
