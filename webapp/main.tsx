import React from "react";
import ReactDOM from "react-dom/client";
import "./init-monaco";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Routing } from "./routing";
import { UserSettingsProvider, useNotifications } from "./providers";
import { AppShell, MantineProvider } from "@mantine/core";
import { useUserSettings } from "./providers/user-settings-provider";
import { SideBar } from "./components";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "allotment/dist/style.css";
import { listen } from "@tauri-apps/api/event";
import { TauriError } from "./tauri/error";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

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
                  paddingLeft: "calc(var(--mantine-navbar-width, 0px))",
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
