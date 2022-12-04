import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserSettings } from "../models";
import { getConfiguration, setConfiguration } from "../tauri/configuration";

type AppStateContextType = {
  userSettings: UserSettings;
  setUserSettings: (reduce: (s: UserSettings) => UserSettings) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  userSettings: {
    clusters: [],
    theme: "Light",
    showNotifications: false,
    useRegex: true,
    sqlTimeoutSeconds: 5,
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
    setUserSettings: (reduce: (_: UserSettings) => UserSettings) => setState(reduce),
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
