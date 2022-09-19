import { IconCheck, IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";

export type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
};

const addNotification = (n: Notification) => {
  showNotification({
    id: n.title,
    autoClose: n.type == "ok" ? 5000 : false,
    title: n.title,
    message: n.description,
    color: n.type == "ok" ? "teal" : "red",
    icon: n.type == "ok" ? <IconCheck /> : <IconX />,
  });
};

export const notifyAlert = (title?: string, description?: string) =>
  addNotification({ type: "error", title, description });
export const notifySuccess = (title?: string, description?: string) =>
  addNotification({ type: "ok", title, description });
