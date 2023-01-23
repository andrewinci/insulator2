import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons";
import { ActionIcon } from "@mantine/core";
import { setWindowMinSize } from "../tauri/helpers";

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
  if (isMinimizedMap["sidebar"] && isMinimizedMap["itemList"]) setWindowMinSize(620, 600);
  else if (isMinimizedMap["sidebar"]) setWindowMinSize(1020, 700);
  else if (isMinimizedMap["itemList"]) setWindowMinSize(800, 700);
  else setWindowMinSize(1200, 800);

  return (
    <ActionIcon
      onClick={onClick}
      sx={(theme) => ({
        position: "absolute",
        right: 0,
        bottom: 5,
        opacity: minimized ? 1 : 0.2,
        display: "block",
        marginRight: "6px",
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}>
      {minimized ? <IconArrowBarRight onClick={onClick} /> : <IconArrowBarLeft onClick={onClick} />}
    </ActionIcon>
  );
};
