import { IconCheck, IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";

export type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
};

export const addNotification = (n: Notification) => {
  showNotification({
    id: n.description,
    autoClose: n.type === "ok" ? 3000 : false,
    title: n.title,
    message: n.description,
    color: n.type === "ok" ? "teal" : "red",
    icon: n.type === "ok" ? <IconCheck /> : <IconX />,
  });
};

export const notifySuccess = (title: string, description?: string) => {
  addNotification({
    type: "ok",
    title,
    description,
  });
};

export const notifyFailure = (title: string, description?: string) => {
  addNotification({
    type: "error",
    title,
    description,
  });
};
