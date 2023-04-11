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

export type ApiError = {
  errorType: string;
  message: string;
};

type withNotificationsProps<T> = {
  action: () => Promise<T>;
  successTitle?: string;
  successDescription?: string;
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

  const notifySuccess = (title: string, description?: string, showInModal?: boolean) => {
    addNotification({
      type: "ok",
      title,
      description,
      showInModal,
    });
  };

  const notifyFailure = (title: string, description?: string) => {
    addNotification({
      type: "error",
      title,
      description,
    });
  };

  async function withNotification<T>(props: withNotificationsProps<T>): Promise<T> {
    const { action, successTitle, successDescription } = props;
    try {
      const res = await action();
      if (successTitle) notifySuccess(successTitle, successDescription, props.showInModal);
      return res;
    } catch (err) {
      console.error(err);
      const { errorType, message } = err as ApiError;
      notifyFailure(errorType, message);
      return Promise.reject(err);
    }
  }

  return {
    /**
     * Notify the user of a success.
     * Only visible if the app is not running in a modal.
     * If the app is running in a modal, the notification is only visible if showInModal is true.
     */
    success: notifySuccess,
    /**
     * Notify the user of a failure.
     * Always visible, even if the app is running in a modal.
     */
    failure: notifyFailure,
    withNotification,
  };
};
