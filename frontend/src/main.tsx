import React from "react";
import ReactDOM from "react-dom/client";
import "./init-monaco"; //initialize monaco-js
import { createBrowserRouter, Outlet, Route, RouterProvider, Routes } from "react-router-dom";
import { UserSettingsProvider } from "./providers";
import { AppShell, MantineProvider } from "@mantine/core";
import { useUserSettings } from "./providers/user-settings-provider";
import { SideBar } from "./components";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "allotment/dist/style.css";
import { listen } from "@tauri-apps/api/event";
import { ApiError } from "./tauri/error";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Settings, TopicsPage, SchemasPage, ConsumerGroupsPage } from "./pages";
import "allotment/dist/style.css";
import { ClusterListPage } from "./pages/clusters";
import { Topic } from "./pages/topics/topic/main";
import { Schema } from "./pages/schema-registry/schema";
import { withPropsFromUrlParams } from "./helpers/with-props-from-url";
import { useInitMonaco } from "./init-monaco";
import { RecordDetailsWindow } from "./pages/topics/modals/record-view-modal";
import { useNotification } from "./hooks/use-notification";

const AppContainer = () => {
  return (
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
      <Outlet />
    </AppShell>
  );
};

const ModalContainer = () => {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      <Outlet />
    </div>
  );
};
// modal pages
const SingleTopicPage = withPropsFromUrlParams(Topic);
const SingleSchemaPage = withPropsFromUrlParams(Schema);
const SingleRecordPage = withPropsFromUrlParams(RecordDetailsWindow);

const InsulatorRoutes = () => {
  useInitMonaco();

  return (
    <Routes>
      <Route path="/modal" element={<ModalContainer />}>
        <Route path="cluster/:clusterId/topic/:topicName" element={<SingleTopicPage />} />
        <Route path="cluster/:clusterId/topic/:topicName/record/:id" element={<SingleRecordPage />} />
        <Route path="cluster/:clusterId/schema/:schemaName/:schemaId?" element={<SingleSchemaPage />} />
      </Route>
      <Route path="/" element={<AppContainer />}>
        {/* Clusters */}
        <Route index element={<ClusterListPage />} />
        <Route path="/clusters" element={<ClusterListPage />} />
        <Route path="/cluster/:clusterId/clusters" element={<ClusterListPage />} />
        {/* Topics */}
        <Route path="/cluster/:clusterId/topics" element={<TopicsPage />} />
        <Route path="/cluster/:clusterId/topic/:topicName" element={<TopicsPage />} />
        {/* Schemas */}
        <Route path="/cluster/:clusterId/schemas" element={<SchemasPage />} />
        <Route path="/cluster/:clusterId/schema/:schemaName" element={<SchemasPage />} />
        {/* Consumer groups */}
        <Route path="/cluster/:clusterId/consumers" element={<ConsumerGroupsPage />} />
        <Route path="/cluster/:clusterId/consumer/:consumerName" element={<ConsumerGroupsPage />} />
        {/* Settings */}
        <Route path="/cluster/:clusterId/settings" element={<Settings />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  const { userSettings: appState } = useUserSettings();
  const queryClient = new QueryClient();
  const { failure } = useNotification();
  // listen for errors emitted by the backend
  listen<ApiError>("error", (event) => {
    failure(event.payload.errorType, event.payload.message);
  });
  return (
    <MantineProvider
      theme={{ colorScheme: appState.theme == "Dark" ? "dark" : "light" }}
      withGlobalStyles
      withNormalizeCSS>
      <NotificationsProvider>
        <ModalsProvider>
          <QueryClientProvider client={queryClient}>
            <InsulatorRoutes />
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
