import { Cluster, UserSettings } from "../../../models";

export const upsertCluster = (s: UserSettings, cluster: Cluster): UserSettings => {
  if (s.clusters.find((c) => c.id == cluster.id)) {
    // update
    return { ...s, clusters: s.clusters.map((c) => (c.id != cluster.id ? c : cluster)) };
  } else {
    // insert
    return { ...s, clusters: [...s.clusters, cluster] };
  }
};
