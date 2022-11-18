import { Group, ThemeIcon, UnstyledButton, Text } from "@mantine/core";
import { Link } from "react-router-dom";

// From https://github.com/mantinedev/mantine/blob/master/src/mantine-demos/src/demos/core/AppShell/_mainLinks.tsx

interface SidebarItemProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  url: string;
  active?: boolean;
}

export const SidebarItem = ({ icon, color, label, url, active }: SidebarItemProps) => {
  return (
    <UnstyledButton
      component={Link}
      to={url}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        backgroundColor: !active ? "unset" : theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        "&:hover": {
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}>
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
};
