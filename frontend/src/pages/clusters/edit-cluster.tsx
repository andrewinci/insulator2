import { useUserSettings, useNotifications } from "../../providers";
import { Cluster } from "../../models";
import { ClusterForm, ClusterFormType } from "./cluster-form";
import { mapClusterToForm, mapFormToCluster, upsertCluster } from "./helpers";

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
    const newCluster = await mapFormToCluster(c);
    await editCluster(cluster.id, newCluster).then((_) => onSubmit());
  };

  return <ClusterForm initialValues={mapClusterToForm(cluster)} onSubmit={onFormSubmit} />;
};
