import { CodeEditor } from "@components";
import { Autocomplete, Button, Group, Input, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNotifications } from "@providers";
import { postSchema } from "@tauri/schema-registry";
import { useState } from "react";
import { Form } from "react-router-dom";

type FormType = { subjectName: string; avroSchema: string };

export const AddSchemaModal = ({
  subjects,
  clusterId,
  onClose,
}: {
  subjects: string[];
  clusterId: string;
  onClose: () => void;
}) => {
  const [state, setState] = useState<{ isUploading: boolean }>({ isUploading: false });
  const schemaNameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/g;
  const form = useForm<FormType>({
    initialValues: {
      subjectName: "",
      avroSchema: `{
    "type" : "record",
    "name" : "Example",
    "namespace" : "Insulator2",
    "fields" : [
        { "name" : "Field1" , "type" : "string" },
        { "name" : "Field2" , "type" : "int" }
    ]
}`,
    },
    validate: {
      subjectName: (v) => (schemaNameRegex.test(v) ? null : "Invalid schema name"),
      avroSchema: (v) => {
        try {
          JSON.parse(v);
          return null;
        } catch (err) {
          return `${err}`;
        }
      },
    },
  });
  const { success } = useNotifications();
  const onSubmit = async (v: FormType) => {
    setState({ isUploading: true });
    try {
      await postSchema(clusterId, v.subjectName, v.avroSchema)
        .then((_) => success(`Schema ${v.subjectName} successfully created`))
        .then((_) => onClose());
    } finally {
      setState({ isUploading: false });
    }
  };

  return (
    <Form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Autocomplete
          label="Subject name"
          placeholder="schema name...."
          data={subjects}
          {...form.getInputProps("subjectName")}
        />
        <Input.Wrapper id="schema-input" label="Avro schema" error={form.getInputProps("avroSchema").error}>
          <div
            style={{
              backgroundColor: "#000000",
              borderRadius: "4px",
              minHeight: "400px",
              height: "100%",
              overflowY: "auto",
            }}>
            <CodeEditor id="schema-input" {...form.getInputProps("avroSchema")} language="json" height="400px" />
          </div>
        </Input.Wrapper>
        <Group position="apart">
          <Text color={"red"}></Text>
          <Button loading={state.isUploading} type="submit" size="sm">
            Validate and submit
          </Button>
        </Group>
      </Stack>
    </Form>
  );
};
