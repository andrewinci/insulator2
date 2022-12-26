import { Cluster, UserSettings } from "../../../models";

export const upsertCluster = (s: UserSettings, cluster: Cluster): UserSettings => {
  const currentCluster = s.clusters.find((c) => c.id == cluster.id);
  if (currentCluster) {
    // update
    return {
      ...s,
      clusters: s.clusters.map((c) => (c.id != cluster.id ? c : { ...cluster, favorites: currentCluster.favorites })),
    };
  } else {
    // insert
    return { ...s, clusters: [...s.clusters, cluster] };
  }
};
