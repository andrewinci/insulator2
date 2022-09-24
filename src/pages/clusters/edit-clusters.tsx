import { Container, Divider, Title } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { useAppState, notifyAlert } from "../../providers";
import { v4 as uuid } from "uuid";
import { Cluster, ClusterAuthentication } from "../../kafka";
import {
  AuthenticationFormType,
  ClusterForm,
  ClusterFormType,
  SaslFormType,
  SslFormType,
} from "./form";

export const EditCluster = () => {
  const { clusterId } = useParams();
  const { setAppState, appState } = useAppState();
  const navigate = useNavigate();

  if (!clusterId) {
    notifyAlert("Something went wrong", "Missing clusterId in navigation.");
    return <></>;
  }

  const cluster = appState.clusters.find((c) => c.id == clusterId);

  const editCluster = (clusterId: string, cluster: Cluster) => {
    if (!appState.clusters.find((c) => c.id == clusterId)) {
      notifyAlert("Cluster configuration not found", `Unable to update ${cluster.name}.`);
      return Promise.reject();
    } else {
      const clusters = appState.clusters.map((c) => (c.id != clusterId ? c : cluster));
      return setAppState({ ...appState, clusters });
    }
  };

  const onSubmit = async (c: ClusterFormType) => {
    const newCluster = mapFormToCluster(c);
    await editCluster(clusterId, newCluster).then((_) => navigate("/clusters"));
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
  const { setAppState, appState } = useAppState();

  const addCluster = (cluster: Cluster) => {
    if (appState.clusters.find((c) => c.name == cluster.name)) {
      notifyAlert(
        "Cluster configuration already exists",
        `A cluster with the name "${cluster.name}" already exists. Try with another name.`
      );
      return Promise.reject();
    } else {
      return setAppState({ ...appState, clusters: [...appState.clusters, cluster] });
    }
  };

  const navigate = useNavigate();
  const onSubmit = async (c: ClusterFormType) => {
    const newCluster = mapFormToCluster(c);
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
  let type: AuthenticationFormType = "None";
  let sasl: SaslFormType = { username: "", password: "", scram: false };
  let ssl: SslFormType | undefined;
  if (authentication == "None") type = "None";
  else if ("Sasl" in authentication) {
    type = "SASL";
    sasl = authentication.Sasl;
  } else if ("ssl" in authentication) {
    type = "SSL";
    //todo
    ssl = { certificateLocation: "", caLocation: "", keyLocation: "", keyPassword: "" };
  }

  return { name, endpoint, authentication: { type, sasl, ssl } };
}

function mapFormToCluster(c: ClusterFormType): Cluster {
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
      throw "Not supported";
  }
  return {
    id: uuid(),
    name: c.name,
    endpoint: c.endpoint,
    authentication,
  };
}
