import { Button, Checkbox, Chip, Group, Input, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { CodeEditor, ResizableModal } from "../../../components";
import { useNotifications } from "../../../providers";
import { produceRecord } from "../../../tauri/producer";

type FormType = { key: string; value: string; tombstone: boolean; mode: "Avro" | "String" };

type AddSchemaModalProps = {
  topic: string;
  clusterId: string;
  opened: boolean;
  onClose: () => void;
};

export const ProducerModal = ({ topic, clusterId, opened, onClose }: AddSchemaModalProps) => {
  const [state, setState] = useState<{ isProducing: boolean }>({ isProducing: false });
  const form = useForm<FormType>({
    initialValues: {
      key: "",
      value: "",
      mode: "Avro",
      tombstone: false,
    },
    validate: {
      key: (v) => (v === null || v.length === 0 ? "Record key must be non empty" : null),
    },
  });
  const { success } = useNotifications();
  const onSubmit = async (v: FormType) => {
    setState({ isProducing: true });
    try {
      await produceRecord(clusterId, topic, v.key, v.tombstone ? null : v.value, v.mode);
      onClose();
      success("Record produced to kafka");
    } finally {
      setState({ isProducing: false });
    }
  };

  return (
    <ResizableModal
      minHeight={form.values.tombstone ? 300 : 700}
      maxHeight={form.values.tombstone ? 300 : undefined}
      title={"Produce a new record"}
      opened={opened}
      onClose={onClose}>
      <form style={{ height: "100%" }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack spacing={3} style={{ height: "100%" }}>
          <TextInput label="Topic name" readOnly value={topic} />
          <TextInput
            label="Key"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            {...form.getInputProps("key")}
          />
          <Group position="apart">
            <Input.Wrapper label="Serialization">
              <Chip.Group position="left" multiple={false} {...form.getInputProps("mode")}>
                <Chip value="Avro">Avro</Chip>
                <Chip value="String">String</Chip>
              </Chip.Group>
            </Input.Wrapper>
            <Input.Wrapper label="Tombstone">
              <Checkbox
                label="Set the Record value to null"
                {...form.getInputProps("tombstone", { type: "checkbox" })}
              />
            </Input.Wrapper>
          </Group>
          <Input.Wrapper
            hidden={form.values.tombstone}
            style={{ height: "calc(100% - 100px)" }}
            label="Record value"
            error={form.getInputProps("value").error}>
            <CodeEditor
              //todo: the language needs to change depending on the serialization mode
              language="json"
              height="calc(100% - 30px)"
              {...form.getInputProps("value")}
            />
          </Input.Wrapper>
          <Group position="apart">
            <Text color={"red"}></Text>
            <Button loading={state.isProducing} type="submit" size="sm">
              Validate and submit
            </Button>
          </Group>
        </Stack>
      </form>
    </ResizableModal>
  );
};
