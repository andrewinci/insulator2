import { invoke } from "@tauri-apps/api";

export type ClusterAuthentication =
  | { Sasl: { username: string; password: string; scram: boolean } }
  | {
      Ssl: {
        caLocation: string;
        certificateLocation: string;
        keyLocation: string;
        keyPassword?: string;
      };
    }
  | "None";

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};

export type Cluster = {
  id: string;
  name: string;
  endpoint: string;
  authentication: ClusterAuthentication;
  schemaRegistry?: SchemaRegistry;
};

export type TopicInfo = {
  name: string;
};

export function getTopicList(cluster: Cluster): Promise<TopicInfo[]> {
  return invoke<TopicInfo[]>("list_topics", { cluster });
}
