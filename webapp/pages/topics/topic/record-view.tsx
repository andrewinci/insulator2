import { Text, Group, Stack, TextInput } from "@mantine/core";
import dayjs from "dayjs";
import { CodeEditor } from "../../../components";
import { pretty } from "../../../helpers/json";
import { KafkaRecord } from "../../../models";

type RecordDetailsViewProps = {
  topic: string;
  record: KafkaRecord;
};

export const RecordDetailsView = ({ record, topic }: RecordDetailsViewProps) => {
  const timestamp = record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A";
  return (
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
      <div>
        <Text mb={2} weight={500} size={14}>
          Value
        </Text>
        <CodeEditor language="json" height={400} value={pretty(record.payload)} readOnly />
      </div>
    </Stack>
  );
};
