import { invoke } from "@tauri-apps/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNotifications } from "./notification-provider";

export type AppTheme = "Light" | "Dark";
type AppState = {
  clusters: Cluster[];
  theme: AppTheme;
};

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

type AppStateContextType = {
  state: AppState;
  setState: (state: AppState) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  state: {
    clusters: [],
    theme: "Light",
  },
  setState: () => {
    throw new Error("Not implemented");
  },
};

const AppStateContext = createContext<AppStateContextType>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(defaultAppState.state);
  const { success, alert } = useNotifications();

  useEffect(() => {
    invoke<AppState>("get_configuration")
      .then((config) => {
        success("Configuration loaded");
        setAppState(config);
      })
      .catch((err) => alert("Unable to retrieve the user config", err));
  }, []);

  const context: AppStateContextType = {
    state: appState,
    setState: (config: AppState) => {
      return invoke<AppState>("write_configuration", { config })
        .then((config) => setAppState(config))
        .catch((err) => {
          alert("Unable to update the user config", err);
          //keep the promise in a rejected state for downstream handle
          throw err;
        });
    },
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
