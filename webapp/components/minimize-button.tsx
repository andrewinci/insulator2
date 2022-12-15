import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons";
import { Group, ThemeIcon, UnstyledButton } from "@mantine/core";

type MinimizeButtonProps = {
  minimized: boolean;
  onClick: () => void;
};
export const MinimizeButton = ({ minimized, onClick }: MinimizeButtonProps) => {
  return (
    <UnstyledButton
      onClick={onClick}
      sx={(theme) => ({
        position: "absolute",
        right: 0,
        bottom: 0,
        opacity: minimized ? 1 : 0.2,
        display: "block",
        marginTop: "5px",
        width: "42px",
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
