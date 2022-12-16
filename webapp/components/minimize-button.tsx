import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons";
import { Group, ThemeIcon, UnstyledButton } from "@mantine/core";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";

const isMinimizedMap = {
  sidebar: false,
  itemList: false,
};

type MinimizeButtonProps = {
  minimized: boolean;
  minimizeTarget: "sidebar" | "itemList";
  onClick: () => void;
};

export const MinimizeButton = ({ minimized, minimizeTarget, onClick }: MinimizeButtonProps) => {
  isMinimizedMap[minimizeTarget] = minimized;
  if (isMinimizedMap["sidebar"] && isMinimizedMap["itemList"]) appWindow.setMinSize(new LogicalSize(620, 600));
  else if (isMinimizedMap["sidebar"]) appWindow.setMinSize(new LogicalSize(1020, 700));
  else if (isMinimizedMap["itemList"]) appWindow.setMinSize(new LogicalSize(800, 700));
  else appWindow.setMinSize(new LogicalSize(1200, 800));

  return (
    <UnstyledButton
      onClick={onClick}
      sx={(theme) => ({
        position: "absolute",
        right: 0,
        bottom: 5,
        opacity: minimized ? 1 : 0.2,
        display: "block",
        width: "40px",
        padding: 8,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        "&:hover": {
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}>
      <Group>
        <ThemeIcon size={27} color={"black"} variant="light">
          {minimized ? <IconArrowBarRight onClick={onClick} style={{}} /> : <IconArrowBarLeft onClick={onClick} />}
        </ThemeIcon>
      </Group>
    </UnstyledButton>
  );
};
