import { Input, Group, Stack, TextInput, Container, Title } from "@mantine/core";

import dayjs from "dayjs";
import { CodeEditor, ResizableModal } from "../../../components";
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
  const { record, topic, heightOffset } = props;
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
        <TextInput readOnly label="Key" value={record.key} />
      </Stack>
      <Input.Wrapper mt={3} style={{ height: `calc(100% - ${heightOffset}px)` }} label="Value">
        <CodeEditor path={topic} language="json" height={"100%"} value={pretty(record.payload)} readOnly />
      </Input.Wrapper>
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
      <RecordDetailsForm {...props} heightOffset={200} />
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
