import { Autocomplete, Button, Group, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Form } from "react-router-dom";

export const AddSchemaModal = ({ subjects }: { subjects: string[] }) => {
  const form = useForm({
    initialValues: {
      subjectName: "",
      avroSchema: `{
    "type" : "record",
    "namespace" : "Insulator2",
    "name" : "Employee",
    "fields" : [
        { "name" : "Field1" , "type" : "string" },
        { "name" : "Field2" , "type" : "int" }
    ]
}`,
    },
  });
  return (
    <Form>
      <Stack>
        <Autocomplete
          label="Subject name"
          placeholder="schema name...."
          data={subjects}
          {...form.getInputProps("subjectName")}
        />
        <div>
          <Text mb={0} size={14}>
            Schema
          </Text>
          <div
            style={{
              backgroundColor: "#000000",
              borderRadius: "4px",
              minHeight: "400px",
              height: "100%",
              overflowY: "auto",
            }}>
            <CodeEditor
              {...form.getInputProps("avroSchema")}
              language="json"
              minHeight={200}
              style={{
                fontSize: 12,
                backgroundColor: "#000000",
                fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
            />
          </div>
        </div>
        <Group position="apart">
          <Text color={"red"}></Text>
          <Button size="sm">Validate and create</Button>
        </Group>
      </Stack>
    </Form>
  );
};
