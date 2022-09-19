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
  const toggleColorScheme = () => {
    const newTheme = colorScheme == "light" ? "Dark" : "Light"
    setColorScheme(newTheme.toLowerCase() as ColorScheme);
    invoke("set_theme", { theme: newTheme }).catch((err) => addNotification({ type: "error", title: "Unable to update the user config", description: err }));
  };
  const { addNotification } = useNotifications();

  useEffect(() => {
    invoke<InsulatorConfig>("get_configuration")
      .then((config) => {
        addNotification({ type: "ok", title: "Configuration loaded" });
        switch (config.theme) {
          case "Dark": setColorScheme("dark"); break;
          case "Light": setColorScheme("light"); break;
        }
      })
      .catch((err) => addNotification({ type: "error", title: "Unable to retrieve the user config", description: err }))
  }, []);


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
          <Route path="settings" element={<Settings />} />
        </Routes>
        <NotificationBar />
      </AppShell>
    </MantineProvider >

  );
}
