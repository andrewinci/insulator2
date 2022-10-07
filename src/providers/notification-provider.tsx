import { IconCheck, IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useAppState } from "./app-state-provider";

export type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
};

export const addNotification = (n: Notification) => {
  showNotification({
    id: n.description,
    autoClose: n.type == "ok" ? 5000 : false,
    title: n.title,
    message: n.description,
    color: n.type == "ok" ? "teal" : "red",
    icon: n.type == "ok" ? <IconCheck /> : <IconX />,
  });
};

export const useNotifications = () => {
  const { appState } = useAppState();
  const { showNotifications } = appState;
  return {
    alert: (title?: string, description?: string) => addNotification({ type: "error", title, description }),
    success: (title?: string, description?: string) =>
      showNotifications
        ? addNotification({ type: "ok", title, description })
        : console.log((title ?? "") + (description ?? "")),
  };
};
