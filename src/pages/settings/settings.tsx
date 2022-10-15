import { Button, Checkbox, Container, Divider, Select, Stack, Title, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { useNotifications } from "../../providers";
import { AppTheme, useAppState } from "../../providers/app-state-provider";

export const Settings = () => {
  const { appState, setAppState } = useAppState();
  const { success } = useNotifications();
  const clearFavorites = () => {
    openConfirmModal({
      title: "Clear favorites",
      children: <Text size="sm">Are you sure to delete all favorites topics, schemas and consumer groups?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        localStorage.clear();
        success("Favorites cache cleaned", undefined, true);
      },
    });
  };

  return (
    <Container>
      <Title mb={10}>Settings</Title>
      <Divider mb={10}></Divider>
      <Stack style={{ maxWidth: "400px" }}>
        <Select
          label="Theme"
          defaultValue={"Light"}
          value={appState.theme}
          data={[
            { value: "Dark", label: "Dark" },
            { value: "Light", label: "Light" },
          ]}
          onChange={(v) => {
            if (v) {
              setAppState({ ...appState, theme: v as AppTheme });
            }
          }}
        />
        <Checkbox
          label="Hide notifications"
          checked={!appState.showNotifications}
          onChange={(c) => setAppState({ ...appState, showNotifications: !c.target.checked })}
        />
        <Button onClick={clearFavorites}>Clear favorites ❌</Button>
      </Stack>
    </Container>
  );
};
