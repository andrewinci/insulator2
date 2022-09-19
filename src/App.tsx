import { AppShell, MantineProvider } from "@mantine/core";
import { Route, Routes } from "react-router-dom";
import { useAppState } from "./providers/app-state-provider";
import { SideBar, NotificationBar } from "./components";
import { Clusters, Settings, TopicList } from "./pages";
import { ModalsProvider } from "@mantine/modals";

export const App = () => {
  const { state } = useAppState();
  return (
    <MantineProvider
      theme={{ colorScheme: state.theme == "Dark" ? "dark" : "light" }}
      withGlobalStyles
      withNormalizeCSS>
      <ModalsProvider>
        <AppShell
          padding={"md"}
          navbar={<SideBar clusterName={state.activeCluster?.name} />}
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
            },
          })}>
          <Routes>
            <Route index element={<h1>TODO: some home page</h1>} />
            <Route path="clusters/*" element={<Clusters />} />
            <Route path="settings" element={<Settings />} />
            <Route path="topics" element={<TopicList />} />
          </Routes>
          <NotificationBar />
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
};
