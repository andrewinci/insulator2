import { Input, Group, Stack, TextInput } from "@mantine/core";

import dayjs from "dayjs";
import { CodeEditor, ResizableModal } from "../../../components";
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
    <ResizableModal onClose={onClose} opened={opened} title={"Record details"}>
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
    </ResizableModal>
  );
};
