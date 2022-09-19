import { Button, Container, Divider, Group, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState, useNotifications } from "../../providers";
import { v4 as uuid } from "uuid";
import { Cluster } from "../../kafka";

export const EditCluster = () => {
  const { clusterId } = useParams();
  const navigate = useNavigate();
  const { alert } = useNotifications();
  const { setState, state } = useAppState();

  const cluster = state.clusters.find((c) => c.id == clusterId);

  const addCluster = (cluster: Cluster) => {
    if (state.clusters.find((c) => c.name == cluster.name)) {
      alert(
        "Cluster configuration already exists",
        `A cluster with name ${cluster.name} already exists.`
      );
      return Promise.reject();
    } else {
      return setState({ ...state, clusters: [...state.clusters, cluster] });
    }
  };

  const editCluster = (clusterId: string, cluster: Cluster) => {
    if (!state.clusters.find((c) => c.id == clusterId)) {
      alert("Cluster configuration not found", `Unable to update ${cluster.name}.`);
      return Promise.reject();
    } else {
      const clusters = state.clusters.filter((c) => c.id != clusterId);
      clusters.push(cluster);
      return setState({ ...state, clusters });
    }
  };

  const form = useForm<Cluster>({
    initialValues: cluster ?? {
      id: uuid(),
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
            await (clusterId ? editCluster(clusterId, values) : addCluster(values)).then((_) =>
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
