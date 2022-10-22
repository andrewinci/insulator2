export type ClusterAuthentication =
  | { Sasl: { username: string; password: string; scram: boolean } }
  | {
      Ssl: {
        ca: string;
        certificate: string;
        key: string;
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

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};
