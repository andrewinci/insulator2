import { invoke } from "@tauri-apps/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Cluster } from "../kafka";
import { notifyAlert, notifySuccess } from "./notification-provider";

export type AppTheme = "Light" | "Dark";
type AppState = {
  activeCluster?: Cluster;
  clusters: Cluster[];
  theme: AppTheme;
};

type AppStateContextType = {
  appState: AppState;
  setActiveCluster: (cluster: Cluster) => void;
  setAppState: (state: AppState) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  appState: {
    clusters: [],
    theme: "Light",
  },
  setActiveCluster: () => {
    throw new Error("Not implemented");
  },
  setAppState: () => {
    throw new Error("Not implemented");
  },
};

const AppStateContext = createContext<AppStateContextType>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(defaultAppState.appState);

  // retrieve the configurations at the first start
  useEffect(() => {
    invoke<AppState>("get_configuration")
      .then((config) => {
        notifySuccess("Configuration loaded");
        setAppState(config);
      })
      .catch((err) => notifyAlert("Unable to retrieve the user config", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAppState]);

  const context: AppStateContextType = {
    appState: appState,
    setActiveCluster: (cluster: Cluster) => setAppState({ ...appState, activeCluster: cluster }),
    setAppState: (configuration: AppState) => {
      return invoke<AppState>("write_configuration", { configuration })
        .then((config) => {
          notifySuccess("Configuration updated");
          setAppState({ ...appState, ...config });
        })
        .catch((err) => {
          notifyAlert("Unable to update the user config", err);
          //keep the promise in a rejected state for downstream handle
          throw err;
        });
    },
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
