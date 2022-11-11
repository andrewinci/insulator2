export type UserSettings = {
  clusters: Record<string, Cluster>;
  theme: AppTheme;
  showNotifications?: boolean;
  useRegex?: boolean;
};

export type AppTheme = "Light" | "Dark";

export type Cluster = {
  id: string;
  name: string;
  endpoint: string;
  authentication?: ClusterAuthentication;
  schemaRegistry: SchemaRegistry | null;
};

export type ClusterAuthentication =
  | { type: "Sasl"; username: string; password: string; scram: boolean }
  | {
      type: "Ssl";
      ca: string;
      certificate: string;
      key: string;
      keyPassword?: string;
    };

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};
