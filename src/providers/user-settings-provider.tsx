import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserSettings, AppTheme, Cluster } from "../models";
import { getConfiguration, setConfiguration } from "../tauri/configuration";

type AppStateContextType = {
  userSettings: UserSettings;
  upsertCluster: (_: Cluster) => Promise<void>;
  removeCluster: (_: string) => Promise<void>;
  setTheme: (_: AppTheme) => Promise<void>;
  setShowNotifications: (_: boolean) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  userSettings: {
    clusters: [],
    theme: "Light",
    showNotifications: false,
  },
} as unknown as AppStateContextType;

const AppStateContext = createContext<AppStateContextType>(defaultAppState);

export const useUserSettings = () => useContext(AppStateContext);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<UserSettings>(defaultAppState.userSettings);

  // retrieve the configurations at the first start
  useEffect(() => {
    getConfiguration().then((s) => setAppState(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAppState]);

  // update the local storage and the react state
  const setState = async (reduce: (s: UserSettings) => UserSettings) => {
    let inProgress;
    setAppState((s) => {
      const newState = reduce(s);
      inProgress = setConfiguration(newState);
      return newState;
    });
    await inProgress;
  };

  const context: AppStateContextType = {
    userSettings: appState,
    upsertCluster: (cluster: Cluster) =>
      setState((s) => {
        console.log(s);
        console.log(cluster);
        if (s.clusters.find((c) => c.id == cluster.id)) {
          // update
          return { ...s, clusters: s.clusters.map((c) => (c.id != cluster.id ? c : cluster)) };
        } else {
          // insert
          return { ...s, clusters: [...s.clusters, cluster] };
        }
      }),
    removeCluster: (clusterId: string) =>
      setState((appState) => ({ ...appState, clusters: appState.clusters.filter((c) => c.id != clusterId) })),
    setTheme: (theme: AppTheme) => setState((s) => ({ ...s, theme })),
    setShowNotifications: (v: boolean) => setState((s) => ({ ...s, showNotifications: v })),
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
