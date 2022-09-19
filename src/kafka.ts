import { invoke } from "@tauri-apps/api";

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

export const getTopicList = async (cluster: Cluster) => {
  return await invoke("list_topics", { cluster })
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
};
