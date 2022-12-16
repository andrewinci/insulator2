import { useForm } from "@mantine/form";
import { AuthenticationFormType, ClusterFormType } from "./types";

export const useClusterForm = (initialValues?: ClusterFormType) => {
  const nonEmptyValidation = (fieldName: string) => (v: string) =>
    v.length > 0 ? null : `${fieldName} must be not empty.`;
  const mandatoryAuthFieldValidation =
    (authType: AuthenticationFormType, field: string) => (v: string, values: unknown) => {
      // the type of values is actually the entire form
      const form = values as unknown as ClusterFormType;
      if (form.authentication.type !== authType) return null;
      else return nonEmptyValidation(field)(v ?? "");
    };
  const form = useForm<ClusterFormType>({
    initialValues: initialValues ?? {
      name: "",
      endpoint: "",
      authentication: {
        type: "None",
        sasl: { username: "", password: "", scram: false },
        ssl: { certificate: "", ca: "", key: "", keyPassword: "" },
        jks: {},
      },
      schemaRegistry: { endpoint: "", username: "", password: "" },
    },
    validate: {
      name: (v) => nonEmptyValidation("Cluster")(v ?? ""),
      // the endpoint must be non empty and without the http protocol
      endpoint: (v) =>
        nonEmptyValidation("Endpoint")(v ?? "") ??
        (v.includes("http://") || v.includes("https://") ? "Remove the protocol http(s):// from the endpoint" : null),
      authentication: {
        type: (v: string) => (["None", "SASL", "SSL", "JKS"].includes(v) ? null : "Unsupported authentication"),
        sasl: {
          username: mandatoryAuthFieldValidation("SASL", "SASL Username"),
          password: mandatoryAuthFieldValidation("SASL", "SASL Password"),
        },
        ssl: {
          ca: mandatoryAuthFieldValidation("SSL", "CA Certificate"),
          certificate: mandatoryAuthFieldValidation("SSL", "Client location"),
          key: mandatoryAuthFieldValidation("SSL", "Client Key"),
        },
        jks: {
          truststoreLocation: mandatoryAuthFieldValidation("JKS", "Truststore location"),
          keystoreLocation: mandatoryAuthFieldValidation("JKS", "Keystore location"),
        },
      },
      schemaRegistry: {
        password: (v: string, values: unknown) => {
          const form = values as ClusterFormType;
          if (!form.schemaRegistry) return null;
          const { endpoint, username } = form.schemaRegistry;
          if ((endpoint ?? "").length > 0 && (username ?? "").length > 0 && (v ?? "").length == 0) {
            return "Schema registry password must be set in order to use Basic authentication.";
          }
        },
      },
    },
  });
  return form;
};
