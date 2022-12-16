import { Group, ThemeIcon, UnstyledButton, Text, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";

// From https://github.com/mantinedev/mantine/blob/master/src/mantine-demos/src/demos/core/AppShell/_mainLinks.tsx

interface SidebarItemProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  url: string;
  active?: boolean;
  minimized?: boolean;
}

export const SidebarItem = ({ icon, color, label, url, active, minimized }: SidebarItemProps) => {
  const navigate = useNavigate();
  return (
    <Tooltip hidden={!minimized} label={label} position={"right"} zIndex={2147483647}>
      <UnstyledButton
        onClick={() => navigate(url)}
        sx={(theme) => ({
          display: "block",
          marginTop: "5px",
          width: minimized ? "42px" : "100%",
          padding: minimized ? 8 : theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
          backgroundColor: !active
            ? "unset"
            : theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
          "&:hover": {
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
          },
        })}>
        <Group>
          <ThemeIcon size={27} color={color} variant="light">
            {icon}
          </ThemeIcon>
          <Text hidden={minimized} size="sm">
            {label}
          </Text>
        </Group>
      </UnstyledButton>
    </Tooltip>
  );
};
