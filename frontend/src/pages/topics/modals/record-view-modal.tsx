import { Input, Group, Stack, TextInput, Container, Title, Text } from "@mantine/core";
import { IconEraser } from "@tabler/icons";

import dayjs from "dayjs";
import { CodeEditor, NewWindowButton, ResizableModal } from "../../../components";
import { pretty } from "../../../helpers/json";
import { KafkaRecord } from "../../../models";

type RecordDetailsModalProps = {
  clusterId: string;
  topic: string;
  record: KafkaRecord;
  opened: boolean;
  onClose: () => void;
};

const RecordDetailsForm = (props: RecordDetailsModalProps & { heightOffset: number }) => {
  const { record, topic, heightOffset, clusterId } = props;
  console.log(record);
  const timestamp = record?.timestamp ? dayjs(record.timestamp).toISOString() : "N/A";
  return (
    <>
      <Stack spacing={3}>
        <Group grow position="apart">
          <TextInput readOnly label="Topic name" value={topic} />
          <TextInput readOnly label="Timestamp(UTC)" value={timestamp} />
        </Group>
        <Group grow position="apart">
          <TextInput readOnly label="Partition" value={record.partition} />
          <TextInput readOnly label="Offset" value={record.offset} />
        </Group>
        <Group grow position="apart">
          <TextInput
            readOnly
            label="Raw record size"
            value={"WIP"} //todo: record.record_bytes
          />
          <Group grow spacing={10}>
            <TextInput
              readOnly
              style={{ maxWidth: "100%" }}
              label="Avro schema id"
              value={record.schema_id ?? "Not an avro record"}
            />
            {record.schema_id && (
              <NewWindowButton
                url={`/modal/cluster/${clusterId}/schema/${topic}-value/${record.schema_id}`}
                windowTitle={`Schema ${topic}-value`}
                tooltipLabel="Open schema in a new window"
                style={{ flexGrow: 0 }}
                mt={20}
                mah={10}
                maw={10}
              />
            )}
          </Group>
        </Group>
        <TextInput readOnly label="Key" value={record.key} />
      </Stack>
      {record.payload && (
        <Input.Wrapper mt={3} style={{ height: `calc(100% - ${heightOffset}px)` }} label="Value">
          <CodeEditor path={topic} language="json" height={"100%"} value={pretty(record.payload)} readOnly />
        </Input.Wrapper>
      )}
      {!record.payload && (
        <Text align="center" mt={20}>
          <IconEraser size={20} /> This record is a tombstone
        </Text>
      )}
    </>
  );
};
export const RecordDetailsModal = (props: RecordDetailsModalProps) => {
  const { clusterId, record, topic, opened, onClose } = props;
  const id = recordId({
    ...record,
    topic,
    clusterId: "123",
  });
  return (
    <ResizableModal
      onClose={onClose}
      opened={opened}
      title={"Record details"}
      newWindowSettings={{
        url: `/modal/cluster/${clusterId}/topic/${topic}/record/${id}`,
        windowTitle: `Record ${topic} ${record.key}`,
        beforeOpen: () => storeProps(id, props),
      }}>
      <RecordDetailsForm {...props} heightOffset={260} />
    </ResizableModal>
  );
};

export const RecordDetailsWindow = ({ id }: { id: string } & JSX.IntrinsicAttributes) => {
  const props = JSON.parse(localStorage.getItem(id) ?? "{}") as RecordDetailsModalProps;
  return (
    <Container pt={10} px={20} style={{ height: "100%", maxWidth: "unset" }}>
      <Title mb={10} order={3}>
        Record details
      </Title>
      <RecordDetailsForm {...props} heightOffset={270} />
    </Container>
  );
};

const recordId = (props: { clusterId: string; topic: string; offset: number; partition: number }) => {
  const { clusterId, topic, offset, partition } = props;
  return `${clusterId}-${topic}-${partition}-${offset}`;
};

const storeProps = (id: string, props: RecordDetailsModalProps): string => {
  localStorage.setItem(id, JSON.stringify(props));
  return id;
};
