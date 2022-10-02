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

export type KafkaRecord = {
  key: string;
  value: string;
  partition: number;
  offset: number;
  timestamp?: number;
};

export type ConsumerState = {
  isRunning: boolean;
  recordCount: number;
};

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};

export type SchemaVersion = {
  subject: string;
  id: number;
  version: number;
  schema: string;
};
