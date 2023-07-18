import { Checkbox, Container, Select, Stack, Center, Button, NumberInput, Text, Group } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { IconAlertTriangle, IconDatabaseExport } from "@tabler/icons";
import { save } from "@tauri-apps/api/dialog";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../../components";
import { AppTheme } from "../../models";
import { useUserSettings } from "../../providers/user-settings-provider";
import { exportDatastore } from "../../tauri/helpers";

export const Settings = () => {
  const { clusterId } = useParams();
  const { userSettings, setUserSettings } = useUserSettings();
  const clusterName = useMemo(
    () => userSettings.clusters.find((c) => c.id == clusterId)?.name,
    [userSettings, clusterId],
  );
  const [exportStatus, setExportStatus] = useSessionStorage({
    key: `export-database-${clusterName}`,
    defaultValue: { inProgress: false },
  });

  const exportDB = async () => {
    const outputPath = await save({
      title: "Save SQLite DB",
      defaultPath: `${clusterName?.replace(" ", "_")}.db`,
      filters: [{ name: clusterName ?? "db", extensions: ["db"] }],
    });
    if (!clusterId || !outputPath) return;
    setExportStatus((_) => ({ inProgress: true }));
    try {
      await exportDatastore(clusterId, outputPath);
    } finally {
      setExportStatus((_) => ({ inProgress: false }));
    }
  };

  return (
    <Container fluid>
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
          <NumberInput
            label="Sql Timeout Seconds"
            description={
              <Group spacing={5}>
                <IconAlertTriangle color={"orange"} size={14} />
                <Text color={"orange"}>Require app restart to take effect</Text>
              </Group>
            }
            value={userSettings.sqlTimeoutSeconds}
            onChange={(c) => setUserSettings((s) => ({ ...s, sqlTimeoutSeconds: c }))}
          />
          <NumberInput
            label="Kafka Timeout Seconds"
            description={
              <Group spacing={5}>
                <IconAlertTriangle color={"orange"} size={14} />
                <Text color={"orange"}>Require app restart to take effect</Text>
              </Group>
            }
            value={userSettings.kafkaTimeoutSeconds}
            onChange={(c) => setUserSettings((s) => ({ ...s, kafkaTimeoutSeconds: c }))}
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
          {clusterId && (
            <>
              <Button leftIcon={<IconDatabaseExport />} loading={exportStatus.inProgress} onClick={exportDB}>
                Export sqlite DB
              </Button>
            </>
          )}
        </Stack>
      </Center>
    </Container>
  );
};
