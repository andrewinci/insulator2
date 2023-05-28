import { useNotification } from "../../hooks/use-notification";
import { Cluster } from "../../models";
import { useUserSettings } from "../../providers";
import { ClusterForm, ClusterFormType } from "./cluster-form";
import { mapFormToCluster, upsertCluster } from "./helpers";

export const AddNewCluster = ({ onSubmit }: { onSubmit: () => void }) => {
  const { userSettings, setUserSettings } = useUserSettings();
  const { failure } = useNotification();
  const addCluster = (cluster: Cluster) => {
    if (userSettings.clusters.find((c) => c.name == cluster.name)) {
      failure(
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
    await addCluster(newCluster);
    onSubmit();
  };

  return <ClusterForm onSubmit={onFormSubmit} />;
};
