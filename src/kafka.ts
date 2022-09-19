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

export type TopicInfo = {
  name: string;
};

export function getTopicList(cluster: Cluster): Promise<TopicInfo[]> {
  return invoke<TopicInfo[]>("list_topics", { cluster });
}
