import { createContext, ReactNode, useContext, useState } from "react";
import { v4 as uuid } from "uuid";

export type Notification = {
  type: "ok" | "error";
  title?: string;
  description?: string;
};

type NotificationWithId = Notification & { id: string };

type NotificationContextType = {
  notifications: NotificationWithId[];
  addNotification: (n: Notification) => string;
  alert: (title?: string, description?: string) => string;
  success: (title?: string, description?: string) => string;
  deleteNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  alert: () => {
    throw Error("Not implemented");
  },
  success: () => {
    throw Error("Not implemented");
  },
  addNotification: () => {
    throw Error("Not implemented");
  },
  deleteNotification: () => {
    throw Error("Not implemented");
  },
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);

  const addNotification = (n: Notification) => {
    const id = uuid();
    setNotifications([{ ...n, id }, ...notifications]);
    return id;
  };
  const deleteNotification = (id: string) =>
    setNotifications(notifications.filter((n) => n.id != id));
  return (
    <NotificationContext.Provider
      value={{
        notifications: notifications,
        addNotification,
        deleteNotification,
        alert: (title?: string, description?: string) =>
          addNotification({ type: "error", title, description }),
        success: (title?: string, description?: string) =>
          addNotification({ type: "ok", title, description }),
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
