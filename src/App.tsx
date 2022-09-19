import { AppShell, MantineProvider } from "@mantine/core";
import { invoke } from "@tauri-apps/api";
import { stat } from "fs";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppState } from "./app-state-provider";
import { ColorScheme, SideBar, NotificationBar, useNotifications } from "./components";
import { Clusters, Settings } from "./pages";

export const App = () => {
  const { state } = useAppState();
  return (
    <MantineProvider theme={{ colorScheme: state.theme == "Dark" ? "dark" : "light" }} withGlobalStyles withNormalizeCSS>
      <AppShell
        padding={"md"}
        navbar={<SideBar clusterName="Local cluster" />}
        // header={<TopBar colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}>
        <Routes>
          <Route index element={<Clusters />} />
          <Route path="clusters" element={<Clusters />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
        <NotificationBar />
      </AppShell>
    </MantineProvider >

  );
}
