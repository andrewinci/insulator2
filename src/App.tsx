import { ActionIcon, AppShell, Box, Group, Header, MantineProvider, Navbar, ScrollArea, Title, Image } from "@mantine/core";
import { NavBarLink } from "./components/navbar-link";
import { IconMoonStars, IconServer, IconSun } from "@tabler/icons";
import { useState } from "react";
import logo from '../src-tauri/icons/128x128.png';

const SideBar = ({ clusterName }: { clusterName: string }) => <Navbar width={{ base: 150 }} p="xs">
  <Navbar.Section mt="xs" >
    <Title order={4} >{clusterName}</Title>
  </Navbar.Section>
  <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
    <Box py="md">
      <NavBarLink icon={<IconServer size={16} />} color={"blue"} label={"Clusters"} />
    </Box>
  </Navbar.Section>
</Navbar>

type ColorScheme = "dark" | "light"
type TopBarProps = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void
}

const TopBar = ({ toggleColorScheme, colorScheme }: TopBarProps) => <Header height={50}>
  <Group style={{ height: "100%" }} ml={"sm"} mr={"sm"} align={"center"} position={"apart"}>
    <Group spacing={10}>
      <Image width={30} height={30} src={logo} alt="insulator" />
      <Title order={2}>Insulator</Title>
    </Group>
    <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
      {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
    </ActionIcon>
  </Group>
</Header>

export const App = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = () => setColorScheme(colorScheme == "light" ? "dark" : "light")
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
      </AppShell>
    </MantineProvider>
  );
}

