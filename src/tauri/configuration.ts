import { invoke } from "@tauri-apps/api";
import { addNotification, AppState } from "../providers";
import { format, TauriError } from "./error";

export const getConfiguration = (): Promise<AppState> =>
  invoke<AppState>("get_configuration").catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to retrieve the user config", description: format(err) });
    throw err;
  });

export const setConfiguration = (configuration: AppState): Promise<AppState> =>
  invoke<AppState>("write_configuration", { configuration }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to update the user config", description: format(err) });
    throw err;
  });
