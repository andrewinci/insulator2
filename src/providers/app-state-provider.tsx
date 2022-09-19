import { invoke } from "@tauri-apps/api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNotifications } from ".";

export type AppTheme = "Light" | "Dark";

type AppState = {
  // clusters: []
  theme: AppTheme;
};

type AppStateContextType = {
  state: AppState;
  setTheme: (t: AppTheme) => Promise<void>;
};

const defaultAppState: AppStateContextType = {
  state: {
    theme: "Light",
  },
  setTheme: async () => {
    throw Error("Not implemented");
  },
};

const AppStateContext = createContext<AppStateContextType>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>(defaultAppState.state);
  const { addNotification } = useNotifications();

  useEffect(() => {
    invoke<AppState>("get_configuration")
      .then((config) => {
        addNotification({ type: "ok", title: "Configuration loaded" });
        setAppState(config);
      })
      .catch((err) =>
        addNotification({
          type: "error",
          title: "Unable to retrieve the user config",
          description: err,
        })
      );
  }, []);

  const context: AppStateContextType = {
    state: appState,
    setTheme: async (theme: AppTheme) => {
      setAppState({ ...appState, theme });
      invoke("set_theme", { theme })
        .then(() => addNotification({ type: "ok", title: "Theme updated" }))
        .catch((err) =>
          addNotification({
            type: "error",
            title: "Unable to update the user config",
            description: err,
          })
        );
    },
  };

  return <AppStateContext.Provider value={context}>{children}</AppStateContext.Provider>;
};
