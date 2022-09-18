import { AppShell, MantineProvider, Stack } from "@mantine/core";
import { useState } from "react";
import { ColorScheme, TopBar, SideBar, NotificationBar, NotificationsProvider, useNotifications } from "./components";

export const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = () => setColorScheme(colorScheme == "light" ? "dark" : "light");
  return (
    <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
      <NotificationsProvider>
        <AppShell
          padding={"md"}
          navbar={<SideBar clusterName="Local cluster" />}
          header={<TopBar colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />}
          styles={(theme) => ({
            main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
          })}>
          <ContentExample />
          <NotificationBar />
        </AppShell>
      </NotificationsProvider>
    </MantineProvider >
  );
}

const ContentExample = () => {
  const { addNotification } = useNotifications();
  return <div>
    <h1>Here there will be some content</h1>
    <button onClick={() => addNotification({ id: "1", description: "Test", title: "Title", type: "ok" })}>Notify</button>
  </div>
}