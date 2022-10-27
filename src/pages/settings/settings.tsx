import { Button, Checkbox, Container, Divider, Select, Stack, Title, Text, Center } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconTrash } from "@tabler/icons";
import { AppTheme } from "../../models";
import { useNotifications } from "../../providers";
import { useUserSettings } from "../../providers/user-settings-provider";

export const Settings = () => {
  const { userSettings: appState, setTheme, setShowNotifications } = useUserSettings();
  const { success } = useNotifications();
  const clearFavorites = () => {
    openConfirmModal({
      title: "Clear cache",
      children: (
        <Text size="sm">Are you sure to delete all favorites and recent topics, schemas and consumer groups?</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        localStorage.clear();
        success("Cache cleared", undefined, true);
      },
    });
  };

  return (
    <Container>
      <Title mb={10}>Settings</Title>
      <Divider mb={10}></Divider>
      <Center>
        <Stack sx={{ width: "400px" }}>
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
                setTheme(v as AppTheme);
              }
            }}
          />
          <Checkbox
            label="Show notifications"
            checked={appState.showNotifications}
            onChange={(c) => setShowNotifications(c.target.checked)}
          />
          {/* <Checkbox
            label="Use regex in search"
            checked={!appState.useRegex}
            onChange={(c) => setAppState({ ...appState, useRegex: c.target.checked })}
          /> */}
          <Button onClick={clearFavorites}>
            <IconTrash size={18} /> Clear cache
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};
