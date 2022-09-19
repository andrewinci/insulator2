import { invoke } from "@tauri-apps/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Cluster } from "../kafka";
import { useNotifications } from "./notification-provider";

export type AppTheme = "Light" | "Dark";
type AppState = {
  activeCluster?: Cluster;
  clusters: Cluster[];
  theme: AppTheme;
};

type AppStateContextType = {
  state: AppState;
  setActiveCluster: (cluster: Cluster) => void;
  setState: (state: AppState) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  state: {
    clusters: [],
    theme: "Light",
  },
  setActiveCluster: () => {
    throw new Error("Not implemented");
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

  // retrieve the configurations at the first start
  useEffect(() => {
    invoke<AppState>("get_configuration")
      .then((config) => {
        success("Configuration loaded");
        setAppState(config);
      })
      .catch((err) => alert("Unable to retrieve the user config", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAppState]);

  const context: AppStateContextType = {
    state: appState,
    setActiveCluster: (cluster: Cluster) => setAppState({ ...appState, activeCluster: cluster }),
    setState: (configuration: AppState) => {
      return invoke<AppState>("write_configuration", { configuration })
        .then((config) => setAppState({ ...appState, ...config }))
        .catch((err) => {
          alert("Unable to update the user config", err);
          //keep the promise in a rejected state for downstream handle
          throw err;
        });
    },
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
