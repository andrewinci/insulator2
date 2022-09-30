import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Routing } from "./Routing";
import { AppStateProvider } from "./providers";
import { AppShell, MantineProvider } from "@mantine/core";
import { useAppState } from "./providers/app-state-provider";
import { SideBar } from "./components";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "allotment/dist/style.css";

const App = () => {
  const { appState } = useAppState();
  return (
    <MantineProvider
      theme={{ colorScheme: appState.theme == "Dark" ? "dark" : "light" }}
      withGlobalStyles
      withNormalizeCSS>
      <NotificationsProvider>
        <ModalsProvider>
          <AppShell
            padding={"md"}
            navbar={<SideBar />}
            styles={(theme) => ({
              main: {
                backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
              },
            })}>
            <Routing />
          </AppShell>
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
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  </React.StrictMode>
);
