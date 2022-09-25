import { AppShell, MantineProvider } from "@mantine/core";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppState } from "./providers/app-state-provider";
import { SideBar } from "./components";
import { Clusters, Settings, TopicsPage, SchemasPage } from "./pages";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "allotment/dist/style.css";

export const App = () => {
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
            navbar={<SideBar clusterName={appState.activeCluster?.name} />}
            styles={(theme) => ({
              main: {
                backgroundColor:
                  theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
              },
            })}>
            <Routes>
              <Route index element={<Navigate to="/clusters/" replace />} />
              <Route path="clusters/*" element={<Clusters />} />
              <Route path="topics" element={<TopicsPage />} />
              <Route path="schemas" element={<SchemasPage />} />
              <Route
                path="consumers"
                element={
                  <div>
                    {" "}
                    <h1>WIP</h1>
                  </div>
                }
              />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </AppShell>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
};
