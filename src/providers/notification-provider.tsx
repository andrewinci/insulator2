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
  deleteNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: (_: Notification) => "",
  deleteNotification: (_: string) => {
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
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
