import { ActionIcon, Group, Header, Title, Image } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";
import logo from '../../src-tauri/icons/128x128.png';

export type ColorScheme = "dark" | "light";

export type TopBarProps = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
};

export const TopBar = ({ toggleColorScheme, colorScheme }: TopBarProps) => <Header height={50}>
  <Group style={{ height: "100%" }} ml={"sm"} mr={"sm"} align={"center"} position={"apart"}>
    <Group spacing={10}>
      <Image width={30} height={30} src={logo} alt="insulator" />
      <Title order={2}>Insulator</Title>
    </Group>
    <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
      {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
    </ActionIcon>
  </Group>
</Header>;
