import { createContext, ReactNode, useContext, useState } from "react";

export type Notification = {
    id: string;
    type: "ok" | "error";
    title: string;
    description: string;
};


type NotificationContextType = {
    notifications: Notification[],
    addNotification: (n: Notification) => void,
    deleteNotification: (id: string) => void,
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: (n: Notification) => { },
    deleteNotification: (id: string) => { }
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const addNotification = (n: Notification) => setNotifications([...notifications, n])
    const deleteNotification = (id: string) => setNotifications(notifications.filter(n => n.id != id))
    return <NotificationContext.Provider value={{ notifications: notifications, addNotification, deleteNotification }}>
        {children}
    </NotificationContext.Provider>
}