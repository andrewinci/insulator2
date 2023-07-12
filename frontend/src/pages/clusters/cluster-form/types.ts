export type AuthenticationFormType = "None" | "SSL" | "SASL" | "JKS";

export type JksFormType = {
  truststoreLocation: string;
  truststorePassword?: string;
  keystoreLocation: string;
  keystorePassword?: string;
};

export type SaslFormType = {
  username: string;
  password: string;
  scram: boolean;
};

export type SslFormType = {
  ca: string;
  certificate: string;
  key: string;
  keyPassword?: string;
};

export type SchemaRegistryFormType = {
  endpoint: string;
  username?: string;
  password: string;
};

export type ClusterFormType = {
  name: string;
  endpoint: string;
  authentication: {
    type: AuthenticationFormType;
    sasl?: SaslFormType;
    ssl?: SslFormType;
    jks?: JksFormType;
  };
  schemaRegistry?: SchemaRegistryFormType;
};
