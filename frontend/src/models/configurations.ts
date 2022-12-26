export type UserSettings = {
  clusters: Cluster[];
  theme: AppTheme;
  showNotifications?: boolean;
  useRegex?: boolean;
  sqlTimeoutSeconds?: number;
  kafkaTimeoutSeconds?: number;
};

export type AppTheme = "Light" | "Dark";

export type Cluster = {
  id: string;
  name: string;
  endpoint: string;
  authentication: ClusterAuthentication;
  schemaRegistry: SchemaRegistry | null;
  favorites: Favorites;
};

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

export type SchemaRegistry = {
  endpoint: string;
  username?: string;
  password?: string;
};

export type Favorites = {
  topics: string[];
  schemas: string[];
  consumers: string[];
};
