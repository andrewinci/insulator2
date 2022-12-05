import "./init-monaco";
import "allotment/dist/style.css";

import { AppShell, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { TauriError } from "@tauri/error";
import { listen } from "@tauri-apps/api/event";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { SideBar } from "./components";
import { useNotifications, UserSettingsProvider } from "./providers";
import { useUserSettings } from "./providers/user-settings-provider";
import { Routing } from "./routing";

const App = () => {
  const { userSettings: appState } = useUserSettings();
  const { alert } = useNotifications();
  const queryClient = new QueryClient();
  // listen for errors emitted by the backend
  listen<TauriError>("error", (event) => {
    alert(event.payload.errorType, event.payload.message);
  });

  return (
    <MantineProvider
      theme={{ colorScheme: appState.theme == "Dark" ? "dark" : "light" }}
      withGlobalStyles
      withNormalizeCSS>
      <NotificationsProvider>
        <ModalsProvider>
          <QueryClientProvider client={queryClient}>
            <AppShell
              padding={"md"}
              navbar={<SideBar />}
              styles={(theme) => ({
                main: {
                  backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
                  paddingRight: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              })}>
              <Routing />
            </AppShell>
          </QueryClientProvider>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    errorElement: <App />, //todo: handle 404/500?
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserSettingsProvider>
      <RouterProvider router={router} />
    </UserSettingsProvider>
  </React.StrictMode>
);
