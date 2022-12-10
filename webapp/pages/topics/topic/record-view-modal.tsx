import { Input, Group, Stack, TextInput, Modal, Title } from "@mantine/core";

import dayjs from "dayjs";
import { CodeEditor } from "../../../components";
import { pretty } from "../../../helpers/json";
import { KafkaRecord } from "../../../models";

type RecordDetailsModalProps = {
  topic: string;
  record: KafkaRecord;
  opened: boolean;
  onClose: () => void;
};

export const RecordDetailsModal = (props: RecordDetailsModalProps) => {
  const { record, topic, opened, onClose } = props;
  const timestamp = record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A";
  return (
    <Modal
      onClose={onClose}
      opened={opened}
      title={<Title order={3}>Record details</Title>}
      closeOnClickOutside={false}
      styles={{
        modal: {
          minWidth: 600,
          minHeight: 700,
          height: 700,
          maxHeight: "92vh",
          maxWidth: "92vw",
          position: "absolute",
          resize: "both",
          overflow: "auto",
        },
        body: {
          height: "calc(100% - 50px)",
        },
      }}>
      <Stack spacing={3}>
        <Group grow position="apart">
          <TextInput label="Topic name" value={topic} />
          <TextInput label="Timestamp(UTC)" value={timestamp} />
        </Group>
        <Group grow position="apart">
          <TextInput label="Partition" value={record.partition} />
          <TextInput label="Offset" value={record.offset} />
        </Group>
        <TextInput label="Key" value={record.key} />
      </Stack>
      <Input.Wrapper mt={3} style={{ height: "calc(100% - 210px)" }} label="Value">
        <CodeEditor path={topic} language="json" height={"100%"} value={pretty(record.payload)} readOnly />
      </Input.Wrapper>
    </Modal>
  );
};
