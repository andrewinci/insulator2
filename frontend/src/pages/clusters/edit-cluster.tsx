import { useUserSettings } from "../../providers";
import { Cluster } from "../../models";
import { ClusterForm, ClusterFormType } from "./cluster-form";
import { mapClusterToForm, mapFormToCluster, upsertCluster } from "./helpers";
import { useNotification } from "../../hooks/use-notification";

export const EditCluster = ({ onSubmit, clusterId }: { onSubmit: () => void; clusterId: string }) => {
  const { userSettings, setUserSettings } = useUserSettings();
  const { failure } = useNotification();
  const cluster = userSettings.clusters.find((c) => c.id == clusterId);
  if (!cluster) {
    failure("Something went wrong", "Missing clusterId in navigation.");
    return <></>;
  }

  const editCluster = (clusterId: string, cluster: Cluster) => {
    if (!userSettings.clusters.find((c) => c.id == clusterId)) {
      failure("Cluster configuration not found", `Unable to update ${cluster.name}.`);
      return Promise.reject();
    } else {
      return setUserSettings((s) => upsertCluster(s, { ...cluster, id: clusterId }));
    }
  };

  const onFormSubmit = async (c: ClusterFormType) => {
    const newCluster = await mapFormToCluster(c);
    await editCluster(cluster.id, newCluster);
    onSubmit();
  };

  return <ClusterForm initialValues={mapClusterToForm(cluster)} onSubmit={onFormSubmit} />;
};
