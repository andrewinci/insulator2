import {
  Button,
  Checkbox,
  Chip,
  Group,
  Input,
  PasswordInput,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { IconInfoCircle, IconLock, IconUpload } from "@tabler/icons";
import { ClusterFormType } from "./types";
import { useClusterForm } from "./use-cluster-form";
import { open } from "@tauri-apps/plugin-dialog";

type ClusterFormProps = {
  initialValues?: ClusterFormType;
  onSubmit: (_: ClusterFormType) => void;
};

export const ClusterForm = ({ onSubmit, initialValues }: ClusterFormProps) => {
  const form = useClusterForm(initialValues);
  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      {/* padding required to avoid to have the scroll bar on top of the password eye  */}
      <ScrollArea>
        <Stack spacing={4}>
          <TextInput label="Cluster name" placeholder="My cool cluster" {...form.getInputProps("name")} />
          <TextInput label="Endpoint" placeholder="localhost:9092" {...form.getInputProps("endpoint")} />
          <Title mt={10} order={3}>
            Authentication
          </Title>
          <Chip.Group position="left" multiple={false} {...form.getInputProps("authentication.type")}>
            <Chip value="None">None</Chip>
            <Chip value="SSL">SSL PEM</Chip>
            <Chip value="JKS">SSL JKS</Chip>
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
              <Checkbox label="Use SCRAM" {...form.getInputProps("authentication.sasl.scram", { type: "checkbox" })} />
            </>
          )}
          {form.values.authentication?.type == "SSL" && (
            <>
              <Textarea
                label="CA Certificate"
                placeholder="-----BEGIN CERTIFICATE-----...."
                {...form.getInputProps("authentication.ssl.ca")}
              />
              <Textarea
                label="Client Certificate"
                placeholder="-----BEGIN CERTIFICATE-----...."
                {...form.getInputProps("authentication.ssl.certificate")}
              />
              <Textarea
                label="Client Key"
                placeholder="-----BEGIN PRIVATE KEY-----...."
                {...form.getInputProps("authentication.ssl.key")}
              />
              <PasswordInput
                label="Key Password"
                placeholder="Key password"
                {...form.getInputProps("authentication.ssl.keyPassword")}
              />
            </>
          )}
          {form.values.authentication?.type == "JKS" && (
            <>
              <Group my={6} spacing={3}>
                <IconInfoCircle />
                <Text size={13}>
                  Insulator does not support JKS stores to interact with Kafka. As part of the configuration, <br />
                  Insulator will extract the certificates from the JKSs provided and configure the cluster as{" "}
                  <Text span color={"blue"}>
                    SSL PEM
                  </Text>{" "}
                  <br />
                  Both Keystore and Truststore can be deleted after the first successful configuration.
                </Text>
              </Group>

              <Input.Wrapper label="Truststore location">
                <Group grow={true} position="apart" align={"center"}>
                  <TextInput
                    readOnly
                    // todo:
                    style={{ maxWidth: "600px" }}
                    icon={<IconUpload size={14} />}
                    placeholder="Pick file"
                    value={form.values.authentication.jks?.truststoreLocation}
                  />
                  <Button
                    style={{ maxWidth: "190px" }}
                    rightIcon={<IconLock size={18} />}
                    onClick={async () => {
                      const truststoreLocation = (await open({
                        directory: false,
                        multiple: false,
                      })) as string | null;
                      if (truststoreLocation) {
                        form.setValues((s) => {
                          const keystoreLocation = s.authentication?.jks?.keystoreLocation ?? "";
                          const jks = { ...s.authentication?.jks, truststoreLocation, keystoreLocation };
                          return { ...s, authentication: { ...s.authentication, type: "JKS", jks } };
                        });
                      }
                    }}>
                    Select truststore
                  </Button>
                </Group>
              </Input.Wrapper>
              <PasswordInput
                label="Truststore Password"
                placeholder="Truststore password"
                {...form.getInputProps("authentication.jks.truststorePassword")}
              />
              <Input.Wrapper label="Keystore location">
                <Group grow={true} position="apart" align={"center"}>
                  <TextInput
                    readOnly
                    style={{ maxWidth: "600px" }}
                    icon={<IconUpload size={14} />}
                    placeholder="Pick file"
                    value={form.values.authentication.jks?.keystoreLocation}
                  />
                  <Button
                    style={{ maxWidth: "190px" }}
                    rightIcon={<IconLock size={18} />}
                    onClick={async () => {
                      const keystoreLocation = (await open({
                        directory: false,
                        multiple: false,
                      })) as string | null;
                      if (keystoreLocation) {
                        form.setValues((s) => {
                          const truststoreLocation = s.authentication?.jks?.truststoreLocation ?? "";
                          const jks = { ...s.authentication?.jks, keystoreLocation, truststoreLocation };
                          return { ...s, authentication: { ...s.authentication, type: "JKS", jks } };
                        });
                      }
                    }}>
                    Select keystore
                  </Button>
                </Group>
              </Input.Wrapper>
              <PasswordInput
                label="Keystore Password"
                placeholder="Keystore password"
                {...form.getInputProps("authentication.jks.keystorePassword")}
              />
            </>
          )}
          <Title mt={10} order={3}>
            Schema registry
          </Title>
          <TextInput label="Endpoint" placeholder="localhost:9091" {...form.getInputProps("schemaRegistry.endpoint")} />
          <TextInput label="Username" placeholder="username" {...form.getInputProps("schemaRegistry.username")} />
          <PasswordInput label="Password" placeholder="password" {...form.getInputProps("schemaRegistry.password")} />
        </Stack>
      </ScrollArea>
      <Group my={20} position="right">
        <Button type="submit">Save</Button>
      </Group>
    </form>
  );
};
