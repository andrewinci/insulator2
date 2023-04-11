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
  if (isRunningInModal(window.location.pathname) && !n.showInModal && n.type !== "error") return;
  showNotification({
    id: `${n.title}${n.description}`,
    autoClose: n.type === "ok" ? 3000 : false,
    title: n.title,
    message: n.description,
    color: n.type === "ok" ? "teal" : "red",
    icon: n.type === "ok" ? <IconCheck /> : <IconX />,
  });
};

/**
 * Notify the user of a success.
 * Only visible if the app is not running in a modal.
 * If the app is running in a modal, the notification is only visible if showInModal is true.
 */
export const notifySuccess = (title: string, description?: string, showInModal?: boolean) => {
  addNotification({
    type: "ok",
    title,
    description,
    showInModal,
  });
};

/**
 * Notify the user of a failure.
 * Always visible, even if the app is running in a modal.
 */
export const notifyFailure = (title: string, description?: string) => {
  addNotification({
    type: "error",
    title,
    description,
  });
};

export const useNotification = () => ({
  success: notifySuccess,
  failure: notifyFailure,
});
