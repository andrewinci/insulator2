import { Autocomplete, Button, Group, Input, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { CodeEditor, ResizableModal } from "../../components";
import { postSchema } from "../../tauri/schema-registry";

type FormType = { subjectName: string; avroSchema: string };

type AddSchemaModalProps = {
  subjects: string[];
  clusterId: string;
  opened: boolean;
  onClose: () => void;
};

export const AddSchemaModal = ({ subjects, clusterId, opened, onClose }: AddSchemaModalProps) => {
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
  const onSubmit = async (v: FormType) => {
    setState({ isUploading: true });
    try {
      await postSchema(clusterId, v.subjectName, v.avroSchema).then((_) => onClose());
    } finally {
      setState({ isUploading: false });
    }
  };

  return (
    <ResizableModal title={"Add a new schema"} opened={opened} onClose={onClose}>
      <form style={{ height: "100%" }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack spacing={3} style={{ height: "100%" }}>
          <Autocomplete
            label="Subject name"
            placeholder="schema name...."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data={subjects}
            {...form.getInputProps("subjectName")}
          />
          <Input.Wrapper
            style={{ height: "calc(100% - 100px)" }}
            id="schema-input"
            label="Avro schema"
            error={form.getInputProps("avroSchema").error}>
            <CodeEditor {...form.getInputProps("avroSchema")} language="json" height="calc(100% - 30px)" />
          </Input.Wrapper>
          <Group mt={"1em"} position="right">
            <Button loading={state.isUploading} type="submit" size="sm">
              Validate and submit
            </Button>
          </Group>
        </Stack>
      </form>
    </ResizableModal>
  );
};
