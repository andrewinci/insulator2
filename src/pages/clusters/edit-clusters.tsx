import { Button, Container, Divider, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Cluster, useAppState } from "../../providers";

export const EditCluster = () => {
  const { clusterName } = useParams();
  const navigate = useNavigate();
  const { addCluster, editCluster, state } = useAppState();

  const cluster = state.clusters.find((c) => c.name == clusterName);
  const form = useForm<Cluster>({
    initialValues: cluster ?? {
      name: "",
      endpoint: "",
      authentication: "None",
    },
    validate: {
      name: (v) => (v.length > 0 ? null : "Cluster name must be not empty"),
      endpoint: (v) => (v.length > 0 ? null : "Endpoint must be not empty"), //todo: check for the port
    },
  });

  return (
    <Container>
      <Title>{cluster ? "Edit cluster" : "Add new cluster"}</Title>
      <Divider my={10} />
      <form
        onSubmit={form.onSubmit(
          async (values) =>
            await (clusterName ? editCluster(clusterName, values) : addCluster(values)).then((_) =>
              navigate("/clusters")
            )
        )}>
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
          <Group position="apart">
            <Button component={Link} to="/clusters" color={"red"}>
              Back
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
};
