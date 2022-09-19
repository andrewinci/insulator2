import { Stack, Notification as NotificationComponent } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import styled from "@emotion/styled";
import { useNotifications } from "../../providers";

export const NotificationBar = () => {
  const { notifications, deleteNotification } = useNotifications();
  return (
    <NotificationContainer spacing={10}>
      {notifications.map(({ id, type, title, description }) => (
        <NotificationComponent
          key={id}
          title={title}
          icon={type == "ok" ? <IconCheck size={18} /> : <IconX size={18} />}
          radius="sm"
          color={type == "ok" ? "teal" : "red"}
          onClose={() => deleteNotification(id)}>
          {description}
        </NotificationComponent>
      ))}
    </NotificationContainer>
  );
};

const NotificationContainer = styled(Stack)`
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 99;
  overflow-y: auto;
  height: calc(100vh - 60px);
  flex-direction: column-reverse;
  width: 35%;
`;
