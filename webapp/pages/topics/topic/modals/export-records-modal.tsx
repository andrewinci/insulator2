import { Text, Checkbox, Modal, Title, NumberInput, Stack, Group, Button } from "@mantine/core";
import { useNotifications } from "../../../../providers";
import { save } from "@tauri-apps/api/dialog";
import { useState } from "react";
import { exportRecords } from "@tauri/consumer";

type ExportRecordsModalProps = {
  clusterId: string;
  topicName: string;
  query: string;
  opened: boolean;
  onClose: () => void;
};

export const ExportRecordsModal = ({ clusterId, topicName, query, opened, onClose }: ExportRecordsModalProps) => {
  // export records
  const { success } = useNotifications();

  const [exportState, setExportState] = useState({
    exportAll: true,
    limit: undefined as number | undefined,
    parseTimestamp: true,
  });

  const _exportRecords = async () => {
    try {
      const outputPath = await save({
        title: "Save exported records",
        defaultPath: `${topicName}.csv`,
        filters: [{ name: topicName, extensions: ["csv"] }],
      });
      if (outputPath != null) {
        exportRecords(clusterId, topicName, {
          query,
          outputPath,
          limit: exportState.exportAll ? undefined : exportState.limit,
          overwrite: true,
          parseTimestamp: exportState.parseTimestamp,
        })
          .then((_) => onClose())
          .then((_) => success("Records exported successfully"));
      }
    } finally {
      onClose();
    }
  };
  return (
    <Modal
      size={"sm"}
      opened={opened}
      onClose={onClose}
      closeOnEscape={false}
      closeOnClickOutside={false}
      title={<Title order={3}>Export options</Title>}>
      <Stack>
        <Text>
          Export records from topic{" "}
          <Text span weight={800}>
            {topicName}
          </Text>{" "}
          to a csv file.
        </Text>

        <Checkbox
          label="Parse UNIX timestamp to string"
          checked={exportState.parseTimestamp}
          onChange={(v) => setExportState((s) => ({ ...s, parseTimestamp: v.target.checked }))}
        />
        <Checkbox
          label="Export all consumed records"
          checked={exportState.exportAll}
          onChange={(v) => setExportState((s) => ({ ...s, exportAll: v.target.checked }))}
        />
        {!exportState.exportAll && (
          <NumberInput
            min={0}
            label="Number of records to export"
            onChange={(n) => setExportState((s) => ({ ...s, limit: n }))}
          />
        )}
        <Group position="right">
          <Button onClick={_exportRecords}>Export</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
