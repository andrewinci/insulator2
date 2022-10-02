import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Cluster } from "../models/kafka";
import { getConfiguration, setConfiguration } from "../tauri";

export type AppState = {
  clusters: Cluster[];
  theme: AppTheme;
  showNotifications?: boolean;
};

type AppStateContextType = {
  appState: AppState;
  setAppState: (state: AppState) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  appState: {
    clusters: [],
    theme: "Light",
  },
  setAppState: () => {
    throw new Error("Not implemented");
  },
};

export type AppTheme = "Light" | "Dark";

const AppStateContext = createContext<AppStateContextType>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);
export const useCurrentCluster = () => {
  const { appState } = useAppState();
  const { clusterId } = useParams();
  return appState.clusters.find((c) => c.id == clusterId);
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(defaultAppState.appState);

  // retrieve the configurations at the first start
  useEffect(() => {
    getConfiguration().then((s) => setAppState(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAppState]);

  const context: AppStateContextType = {
    appState: appState,
    setAppState: (configuration: AppState) => {
      return setConfiguration(configuration).then((config) => {
        setAppState({ ...appState, ...config });
      });
    },
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
