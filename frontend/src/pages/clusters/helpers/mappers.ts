import { v4 as uuid } from "uuid";
import { Cluster, ClusterAuthentication } from "../../../models";
import { AuthenticationFormType, ClusterFormType, JksFormType, SaslFormType, SslFormType } from "../cluster-form";
import { parseKeystore, parseTruststore } from "../../../tauri/helpers";

export function mapClusterToForm(cluster?: Cluster): ClusterFormType | undefined {
  if (!cluster) return undefined;
  const { name, endpoint, authentication } = cluster;
  let type: AuthenticationFormType = "None";
  let sasl: SaslFormType = { username: "", password: "", scram: false };
  let ssl: SslFormType = { ca: "", certificate: "", key: "", keyPassword: undefined };
  if (authentication == "None") type = "None";
  else if ("Sasl" in authentication) {
    type = "SASL";

    sasl = authentication.Sasl;
  } else if ("Ssl" in authentication) {
    type = "SSL";
    ssl = authentication.Ssl;
  }

  return {
    name,
    endpoint,
    authentication: { type, sasl, ssl },
    schemaRegistry: {
      endpoint: cluster.schemaRegistry?.endpoint ?? "",
      password: cluster.schemaRegistry?.password ?? "",
      username: cluster.schemaRegistry?.username ?? "",
    },
  };
}

export async function mapFormToCluster(c: ClusterFormType): Promise<Cluster> {
  let authentication: ClusterAuthentication = "None";
  switch (c.authentication.type) {
    case "None":
      authentication = "None";
      break;
    case "SASL":
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authentication = { Sasl: { ...c.authentication.sasl! } };
      break;
    case "SSL":
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authentication = { Ssl: { ...c.authentication.ssl! } };
      break;
    case "JKS":
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      authentication = { Ssl: { ...(await mapJKSConfigToSSLConfig(c.authentication.jks!)) } };
      break;
    default:
      throw "Not supported";
  }
  const nonEmptyOrUndefined = (v: string | undefined): string | undefined => ((v?.length ?? 0) > 0 ? v : undefined);
  return {
    id: uuid(),
    name: c.name,
    endpoint: c.endpoint,
    authentication,
    schemaRegistry:
      c.schemaRegistry && c.schemaRegistry.endpoint
        ? {
            ...c.schemaRegistry,
            username: nonEmptyOrUndefined(c.schemaRegistry.username),
            password: nonEmptyOrUndefined(c.schemaRegistry.password),
          }
        : null,
    favorites: {
      consumers: [],
      schemas: [],
      topics: [],
    },
  };
}

export async function mapJKSConfigToSSLConfig(cfg: JksFormType): Promise<SslFormType> {
  if (!cfg.keystoreLocation || !cfg.truststoreLocation) {
    throw "Keystore and truststore locations must be specified";
  }
  const truststorePromise = parseTruststore(cfg.truststoreLocation, cfg.truststorePassword);
  const keystorePromise = parseKeystore(cfg.keystoreLocation, cfg.keystorePassword);
  const certs = await Promise.all([truststorePromise, keystorePromise]);
  return {
    ca: certs[0],
    certificate: certs[1].certificate,
    key: certs[1].key,
    keyPassword: undefined,
  };
}
