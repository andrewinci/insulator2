import { AppShell, MantineProvider } from "@mantine/core";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { ColorScheme, TopBar, SideBar, NotificationBar, useNotifications } from "./components";

export const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = () => setColorScheme(colorScheme == "light" ? "dark" : "light");
  const { addNotification } = useNotifications();
  useEffect(() => {
    invoke("get_configuration")
      .then(() => addNotification({ type: "ok", title: "Configuration loaded" }))
      .catch((err) => addNotification({ type: "error", title: "Unable to retrieve the user config", description: err }))
  }, []);
  return (
    <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
      <AppShell
        padding={"md"}
        navbar={<SideBar clusterName="Local cluster" />}
        header={<TopBar colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}>
        <div>
          <h1>Here there will be some content</h1>
        </div>
        <NotificationBar />
      </AppShell>
    </MantineProvider >
  );
}
