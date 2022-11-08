import { Container, Divider, Title } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useUserSettings, useNotifications } from "../../providers";
import { Cluster, ClusterAuthentication, UserSettings } from "../../models";
import { AuthenticationFormType, ClusterForm, ClusterFormType, SaslFormType, SslFormType } from "./form";

const upsertCluster = (s: UserSettings, cluster: Cluster): UserSettings => {
  if (s.clusters.find((c) => c.id == cluster.id)) {
    // update
    return { ...s, clusters: s.clusters.map((c) => (c.id != cluster.id ? c : cluster)) };
  } else {
    // insert
    return { ...s, clusters: [...s.clusters, cluster] };
  }
};

export const EditCluster = () => {
  const { alert } = useNotifications();
  const { userSettings, setUserSettings } = useUserSettings();
  const navigate = useNavigate();
  const { clusterId } = useParams();
  const cluster = userSettings.clusters.find((c) => c.id == clusterId);
  if (!cluster) {
    alert("Something went wrong", "Missing clusterId in navigation.");
    return <></>;
  }

  const editCluster = (clusterId: string, cluster: Cluster) => {
    if (!userSettings.clusters.find((c) => c.id == clusterId)) {
      alert("Cluster configuration not found", `Unable to update ${cluster.name}.`);
      return Promise.reject();
    } else {
      return setUserSettings((s) => upsertCluster(s, { ...cluster, id: clusterId }));
    }
  };

  const onSubmit = async (c: ClusterFormType) => {
    const newCluster = mapFormToCluster(c);
    await editCluster(cluster.id, newCluster).then((_) => navigate("/clusters"));
  };

  return (
    <Container>
      <Title>Edit cluster</Title>
      <Divider my={10} />
      <ClusterForm initialValues={mapClusterToForm(cluster)} onSubmit={onSubmit} />
    </Container>
  );
};

export const AddNewCluster = () => {
  const { alert } = useNotifications();
  const { userSettings, setUserSettings } = useUserSettings();

  const addCluster = (cluster: Cluster) => {
    if (userSettings.clusters.find((c) => c.name == cluster.name)) {
      alert(
        "Cluster configuration already exists",
        `A cluster with the name "${cluster.name}" already exists. Try with another name.`
      );
      return Promise.reject();
    } else {
      return setUserSettings((s) => upsertCluster(s, cluster));
    }
  };

  const navigate = useNavigate();
  const onSubmit = async (c: ClusterFormType) => {
    console.log("Add new cluster", c);
    const newCluster = mapFormToCluster(c);
    console.log("Add new cluster", newCluster);
    await addCluster(newCluster).then((_) => navigate("/clusters"));
  };

  return (
    <Container>
      <Title>Add new cluster</Title>
      <Divider my={10} />
      <ClusterForm onSubmit={onSubmit} />
    </Container>
  );
};

function mapClusterToForm(cluster?: Cluster): ClusterFormType | undefined {
  if (!cluster) return undefined;
  const { name, endpoint, authentication } = cluster;
  const schemaRegistry = cluster.schemaRegistry ?? { endpoint: "", password: "", username: "" };
  let type: AuthenticationFormType = "None";
  let sasl: SaslFormType = { username: "", password: "", scram: false };
  let ssl: SslFormType = { ca: "", certificate: "", key: "", keyPassword: undefined };
  if (authentication == "None") type = "None";
  else if ("Sasl" in authentication) {
    type = "SASL";

    sasl = authentication.Sasl;
  } else if ("Ssl" in authentication) {
    type = "SSL";
    ssl = authentication.Ssl;
  }

  return { name, endpoint, authentication: { type, sasl, ssl }, schemaRegistry };
}

function mapFormToCluster(c: ClusterFormType): Cluster {
  console.log("Add new cluster", c);
  let authentication: ClusterAuthentication = "None";
  switch (c.authentication.type) {
    case "None":
      authentication = "None";
      break;
    case "SASL":
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authentication = { Sasl: { ...c.authentication.sasl! } };
      break;
    case "SSL":
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authentication = { Ssl: { ...c.authentication.ssl! } };
      break;
    default:
      throw "Not supported";
  }
  const nonEmptyOrUndefined = (v: string | undefined): string | undefined => ((v?.length ?? 0) > 0 ? v : undefined);
  return {
    id: uuid(),
    name: c.name,
    endpoint: c.endpoint,
    authentication,
    schemaRegistry:
      c.schemaRegistry && c.schemaRegistry.endpoint
        ? {
            ...c.schemaRegistry,
            username: nonEmptyOrUndefined(c.schemaRegistry.username),
            password: nonEmptyOrUndefined(c.schemaRegistry.password),
          }
        : null,
  };
}
