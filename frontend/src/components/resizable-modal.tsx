import { Modal, Title } from "@mantine/core";

type ResizableModalProps = {
  children: React.ReactNode;
  title: string;
  opened: boolean;
  minHeight?: number;
  maxHeight?: number | string;
  onClose: () => void;
};

export const ResizableModal = (props: ResizableModalProps) => {
  const { children, title, opened, minHeight, maxHeight, onClose } = props;
  return (
    <Modal
      onClose={onClose}
      opened={opened}
      title={<Title order={3}>{title}</Title>}
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
      {children}
    </Modal>
  );
};
