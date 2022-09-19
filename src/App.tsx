import { AppShell, MantineProvider } from "@mantine/core";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ColorScheme, SideBar, NotificationBar, useNotifications } from "./components";
import { Clusters, Settings } from "./pages";

type InsulatorConfig = {
  // clusters: []
  theme: "Light" | "Dark"
}

export const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const { addNotification } = useNotifications();

  useEffect(() => {
    invoke<InsulatorConfig>("get_configuration")
      .then((config) => {
        addNotification({ type: "ok", title: "Configuration loaded" });
        setColorScheme(config.theme.toLowerCase() as ColorScheme);
      })
      .catch((err) => addNotification({ type: "error", title: "Unable to retrieve the user config", description: err }))
  }, []);

  const onThemeChange = (v: ColorScheme) => {
    setColorScheme(v);
    invoke("set_theme", { theme: v == "dark" ? "Dark" : "Light" })
      .then(() => addNotification({ type: "ok", title: "Theme updated" }))
      .catch((err) => addNotification({ type: "error", title: "Unable to update the user config", description: err }));
  }

  return (
    <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
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
          <Route path="settings" element={<Settings theme={colorScheme} onThemeChange={onThemeChange} />} />
        </Routes>
        <NotificationBar />
      </AppShell>
    </MantineProvider >

  );
}
