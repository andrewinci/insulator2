import {
  Button,
  Checkbox,
  Chip,
  FileInput,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link } from "react-router-dom";

export type AuthenticationFormType = "None" | "SSL" | "SASL";
export type SaslFormType = {
  username: string;
  password: string;
  scram: boolean;
};
export type SslFormType = {
  caLocation: string;
  certificateLocation: string;
  keyLocation: string;
  keyPassword?: string;
};

export type SchemaRegistryFormType = {
  endpoint: string;
  username?: string;
  password?: string;
};

export type ClusterFormType = {
  name: string;
  endpoint: string;
  authentication: {
    type: AuthenticationFormType;
    sasl?: SaslFormType;
    ssl?: SslFormType;
  };
  schemaRegistry?: SchemaRegistryFormType;
};

type ClusterFormProps = {
  initialValues?: ClusterFormType;
  onSubmit: (_: ClusterFormType) => void;
};

export const ClusterForm = ({ onSubmit, initialValues }: ClusterFormProps) => {
  const nonEmptyValidation = (fieldName: string) => (v: string) =>
    v.length > 0 ? null : `${fieldName} name must be not empty.`;
  const form = useForm<ClusterFormType>({
    initialValues: initialValues ?? {
      name: "",
      endpoint: "",
      authentication: {
        type: "None",
        sasl: { username: "", password: "", scram: false },
        ssl: { certificateLocation: "", caLocation: "", keyLocation: "", keyPassword: "" },
      },
      schemaRegistry: { endpoint: "", username: "", password: "" },
    },
    validate: {
      name: (v) => nonEmptyValidation("Cluster")(v ?? ""),
      endpoint: (v) => nonEmptyValidation("Endpoint")(v ?? ""),
      authentication: {
        type: (v: string) => (["None", "SASL"].includes(v) ? null : "Unsupported authentication"),
        sasl: {
          username: (v, values) => {
            // the type of values is actually the entire form
            const form = values as unknown as ClusterFormType;
            if (form.authentication.type !== "SASL") return null;
            else return nonEmptyValidation("SASL Username")(v ?? "");
          },
          password: (v, values) => {
            // the type of values is actually the entire form
            const form = values as unknown as ClusterFormType;
            if (form.authentication.type != "SASL") return null;
            else return nonEmptyValidation("SASL Password")(v ?? "");
          },
        },
        ssl: {
          //todo
        },
      },
      schemaRegistry: {
        password: (v: string, values: unknown) => {
          const form = values as ClusterFormType;
          if (!form.schemaRegistry) return null;
          const { endpoint, username } = form.schemaRegistry;
          if ((endpoint ?? "").length > 0 && (username ?? "").length > 0 && (v ?? "").length == 0) {
            return "Schema registry password must be set in order to use Basic authentication.";
          }
        },
      },
    },
  });
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Custer name"
          placeholder="My cool cluster"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Endpoint"
          placeholder="localhost:9092"
          {...form.getInputProps("endpoint")}
        />
        <Title order={3}>Authentication</Title>
        <Chip.Group position="left" multiple={false} {...form.getInputProps("authentication.type")}>
          <Chip value="None">None</Chip>
          <Chip value="SSL">SSL (Aiven cloud)</Chip>
          <Chip value="SASL">SASL</Chip>
        </Chip.Group>
        {form.values.authentication?.type == "SASL" && (
          <>
            <TextInput
              label="Username"
              placeholder="username"
              {...form.getInputProps("authentication.sasl.username")}
            />
            <PasswordInput
              label="Password"
              placeholder="password"
              {...form.getInputProps("authentication.sasl.password")}
            />
            <Checkbox
              label="Use SCRAM"
              {...form.getInputProps("authentication.sasl.scram", { type: "checkbox" })}
            />
          </>
        )}
        {form.values.authentication?.type == "SSL" && (
          <>
            <FileInput
              label="CA Certificate location"
              placeholder="/..."
              {...form.getInputProps("authentication.ssl.caLocation")}
            />
            <FileInput
              label="Client Certificate location"
              placeholder="/..."
              {...form.getInputProps("authentication.ssl.certificateLocation")}
            />
            <FileInput
              label="Client Key location"
              placeholder="/..."
              {...form.getInputProps("authentication.ssl.keyLocation")}
            />
            <PasswordInput
              label="Key Password"
              placeholder="Key password"
              {...form.getInputProps("authentication.ssl.keyPassword")}
            />
          </>
        )}
        <Title order={3}>Schema registry</Title>
        <TextInput
          label="Endpoint"
          placeholder="localhost:9092"
          {...form.getInputProps("schemaRegistry.endpoint")}
        />
        <TextInput
          label="Username"
          placeholder="username"
          {...form.getInputProps("schemaRegistry.username")}
        />
        <PasswordInput
          label="Password"
          placeholder="password"
          {...form.getInputProps("schemaRegistry.password")}
        />
        <Group position="apart">
          <Button component={Link} to="/clusters" color={"red"}>
            Back
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  );
};
