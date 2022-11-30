import { Checkbox, Container, Select, Stack, Center } from "@mantine/core";
import { PageHeader } from "../../components";
import { AppTheme } from "../../models";
import { useUserSettings } from "../../providers/user-settings-provider";

export const Settings = () => {
  const { userSettings, setUserSettings } = useUserSettings();

  return (
    <Container>
      <PageHeader title={"Settings"} subtitle={"Customize insulator"} />
      <Center>
        <Stack sx={{ width: "400px" }}>
          <Select
            label="Theme"
            defaultValue={"Light"}
            value={userSettings.theme}
            data={[
              { value: "Dark", label: "Dark" },
              { value: "Light", label: "Light" },
            ]}
            onChange={(v) => {
              if (v) {
                setUserSettings((s) => ({ ...s, theme: v as AppTheme }));
              }
            }}
          />
          <Checkbox
            label="Show notifications"
            checked={userSettings.showNotifications}
            onChange={(c) => setUserSettings((s) => ({ ...s, showNotifications: c.target.checked }))}
          />
          <Checkbox
            label="Use regex in search"
            checked={userSettings.useRegex}
            onChange={(c) => setUserSettings((s) => ({ ...s, useRegex: c.target.checked }))}
          />
        </Stack>
      </Center>
    </Container>
  );
};
