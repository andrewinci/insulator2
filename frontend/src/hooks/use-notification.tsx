import { showNotification } from "@mantine/notifications";
import { useUserSettings } from "../providers";
import { isRunningInModal } from "./use-parsed-url";
import { IconCheck, IconX } from "@tabler/icons";

type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
  showInModal?: boolean;
};

export const useNotification = () => {
  const { userSettings } = useUserSettings();

  const addNotification = (n: Notification) => {
    // Don't show success notifications if the user disabled them
    if (!userSettings.showNotifications && n.type === "ok") return;
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
  return {
    /**
     * Notify the user of a success.
     * Only visible if the app is not running in a modal.
     * If the app is running in a modal, the notification is only visible if showInModal is true.
     */
    success: (title: string, description?: string, showInModal?: boolean) => {
      addNotification({
        type: "ok",
        title,
        description,
        showInModal,
      });
    },
    /**
     * Notify the user of a failure.
     * Always visible, even if the app is running in a modal.
     */
    failure: (title: string, description?: string) => {
      addNotification({
        type: "error",
        title,
        description,
      });
    },
  };
};
