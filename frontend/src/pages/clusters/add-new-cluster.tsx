import { Cluster } from "../../models";
import { useNotifications, useUserSettings } from "../../providers";
import { ClusterForm, ClusterFormType } from "./cluster-form";
import { mapFormToCluster, upsertCluster } from "./helpers";

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
    const newCluster = await mapFormToCluster(c);
    await addCluster(newCluster).then((_) => onSubmit());
  };

  return <ClusterForm onSubmit={onFormSubmit} />;
};
