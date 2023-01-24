import { mapClusterToForm, mapFormToCluster, mapJKSConfigToSSLConfig } from "./mappers";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Cluster } from "../../../models";
import { v4 as uuid } from "uuid";
import { ClusterFormType } from "../cluster-form";
import { parseKeystore, parseTruststore } from "../../../tauri/helpers";

describe("mapClusterToForm", () => {
  it("should return undefined if cluster is not provided", () => {
    expect(mapClusterToForm()).toBeUndefined();
  });

  it('should map the cluster object to the form type for "None" authentication', () => {
    const cluster = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: "None",
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as Cluster;

    const expectedForm = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "None",
        sasl: {
          username: "",
          password: "",
          scram: false,
        },
        ssl: {
          ca: "",
          certificate: "",
          key: "",
          keyPassword: undefined,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    };

    expect(mapClusterToForm(cluster)).toEqual(expectedForm);
  });

  it('should map the cluster object to the form type for "SASL" authentication', () => {
    const cluster = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        Sasl: {
          username: "user",
          password: "password",
          scram: true,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as Cluster;

    const expectedForm = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "SASL",
        sasl: {
          username: "user",
          password: "password",
          scram: true,
        },
        ssl: {
          ca: "",
          certificate: "",
          key: "",
          keyPassword: undefined,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    };
    expect(mapClusterToForm(cluster)).toEqual(expectedForm);
  });

  it('should map the cluster object to the form type for "SSL" authentication', () => {
    const cluster = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        Ssl: {
          ca: "ca.crt",
          certificate: "cert.crt",
          key: "key.pem",
          keyPassword: "password",
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as Cluster;

    const expectedForm = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "SSL",
        sasl: {
          username: "",
          password: "",
          scram: false,
        },
        ssl: {
          ca: "ca.crt",
          certificate: "cert.crt",
          key: "key.pem",
          keyPassword: "password",
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    };

    expect(mapClusterToForm(cluster)).toEqual(expectedForm);
  });
});

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid"),
}));

describe("mapFormToCluster", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map the form object to the cluster object for "None" authentication', async () => {
    const form = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "None",
        sasl: {
          username: "",
          password: "",
          scram: false,
        },
        ssl: {
          ca: "",
          certificate: "",
          key: "",
          keyPassword: undefined,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as ClusterFormType;

    const expectedCluster = {
      id: "mocked-uuid",
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: "None",
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
      favorites: {
        consumers: [],
        schemas: [],
        topics: [],
      },
    };

    expect(await mapFormToCluster(form)).toEqual(expectedCluster);
    expect(uuid).toHaveBeenCalled();
  });

  it('should map the form object to the cluster object for "SASL" authentication', async () => {
    const form = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "SASL",
        sasl: {
          username: "user",
          password: "password",
          scram: true,
        },
        ssl: {
          ca: "",
          certificate: "",
          key: "",
          keyPassword: undefined,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as ClusterFormType;
    const expectedCluster = {
      id: "mocked-uuid",
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        Sasl: {
          username: "user",
          password: "password",
          scram: true,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
      favorites: {
        consumers: [],
        schemas: [],
        topics: [],
      },
    };

    expect(await mapFormToCluster(form)).toEqual(expectedCluster);
    expect(uuid).toHaveBeenCalled();
  });

  it('should map the form object to the cluster object for "SSL" authentication', async () => {
    const form = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "SSL",
        sasl: {
          username: "",
          password: "",
          scram: false,
        },
        ssl: {
          ca: "ca.crt",
          certificate: "cert.crt",
          key: "key.pem",
          keyPassword: "password",
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as ClusterFormType;
    const expectedCluster = {
      id: "mocked-uuid",
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        Ssl: {
          ca: "ca.crt",
          certificate: "cert.crt",
          key: "key.pem",
          keyPassword: "password",
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
      favorites: {
        consumers: [],
        schemas: [],
        topics: [],
      },
    };

    expect(await mapFormToCluster(form)).toEqual(expectedCluster);
    expect(uuid).toHaveBeenCalled();
  });

  it("should throw an error if the form type is not supported", async () => {
    const form = {
      name: "cluster-1",
      endpoint: "localhost:9092",
      authentication: {
        type: "UNSUPPORTED",
        sasl: {
          username: "",
          password: "",
          scram: false,
        },
        ssl: {
          ca: "",
          certificate: "",
          key: "",
          keyPassword: undefined,
        },
      },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "admin",
        password: "admin",
      },
    } as unknown as ClusterFormType;
    await expect(mapFormToCluster(form)).rejects.toThrow("Not supported");
  });
});

vi.mock("../../../tauri/helpers", () => ({
  parseTruststore: vi.fn(() => "ca-certificate"),
  parseKeystore: vi.fn(() => ({ certificate: "client-certificate", key: "client-key" })),
}));

describe("mapJKSConfigToSSLConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should map JKS config to SSL config", async () => {
    const cfg = {
      keystoreLocation: "/path/to/keystore",
      truststoreLocation: "/path/to/truststore",
      keystorePassword: "keystore-password",
      truststorePassword: "truststore-password",
    };

    const expectedSslConfig = {
      ca: "ca-certificate",
      certificate: "client-certificate",
      key: "client-key",
      keyPassword: undefined,
    };

    expect(await mapJKSConfigToSSLConfig(cfg)).toEqual(expectedSslConfig);
    expect(parseTruststore).toHaveBeenCalledWith("/path/to/truststore", "truststore-password");
    expect(parseKeystore).toHaveBeenCalledWith("/path/to/keystore", "keystore-password");
  });

  it("should throw an error if keystoreLocation or truststoreLocation is not specified", async () => {
    const cfg = {
      keystoreLocation: "",
      truststoreLocation: "/path/to/truststore",
      keystorePassword: "keystore-password",
      truststorePassword: "truststore-password",
    };
    await expect(mapJKSConfigToSSLConfig(cfg)).rejects.toThrow("Keystore and truststore locations must be specified");
  });
});
