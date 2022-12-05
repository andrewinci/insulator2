import { v4 as uuid } from "uuid";

import { Cluster, ClusterAuthentication, UserSettings } from "../../models";
import { useNotifications, useUserSettings } from "../../providers";
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

export const EditCluster = ({ onSubmit, clusterId }: { onSubmit: () => void; clusterId: string }) => {
  const { alert } = useNotifications();
  const { userSettings, setUserSettings } = useUserSettings();
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

  const onFormSubmit = async (c: ClusterFormType) => {
    const newCluster = mapFormToCluster(c);
    await editCluster(cluster.id, newCluster).then((_) => onSubmit());
  };

  return <ClusterForm initialValues={mapClusterToForm(cluster)} onSubmit={onFormSubmit} />;
};

export const AddNewCluster = ({ onSubmit }: { onSubmit: () => void }) => {
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

  const onFormSubmit = async (c: ClusterFormType) => {
    const newCluster = mapFormToCluster(c);
    await addCluster(newCluster).then((_) => onSubmit());
  };

  return <ClusterForm onSubmit={onFormSubmit} />;
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
    favorites: {
      consumers: [],
      schemas: [],
      topics: [],
    },
  };
}
