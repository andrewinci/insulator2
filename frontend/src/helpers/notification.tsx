import { IconCheck, IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { isRunningInModal } from "../hooks";

export type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
  showInModal?: boolean;
};

export const addNotification = (n: Notification) => {
  // Don't show notifications in modal if they are not explicitly allowed
  // or if they are not errors
  if (isRunningInModal() && !n.showInModal && n.type !== "error") return;
  showNotification({
    id: n.description,
    autoClose: n.type === "ok" ? 3000 : false,
    title: n.title,
    message: n.description,
    color: n.type === "ok" ? "teal" : "red",
    icon: n.type === "ok" ? <IconCheck /> : <IconX />,
  });
};

export const notifySuccess = (title: string, description?: string, showInModal?: boolean) => {
  addNotification({
    type: "ok",
    title,
    description,
    showInModal,
  });
};

export const notifyFailure = (title: string, description?: string, showInModal?: boolean) => {
  addNotification({
    type: "error",
    title,
    description,
    showInModal,
  });
};
