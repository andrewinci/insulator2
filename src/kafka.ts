export type ClusterAuthentication =
  | { Sasl: { username: string; password: string; scram: boolean } }
  | { Ssl: unknown }
  | "None";

export type Cluster = {
  id: string;
  name: string;
  endpoint: string;
  authentication: ClusterAuthentication;
};

export const getTopicList = (cluster: Cluster) => {
  return cluster;
};
