import { invoke } from "@tauri-apps/api";
import { UserSettings } from "../models";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

export const getConfiguration = (): Promise<UserSettings> =>
  invoke<UserSettings>("get_configuration").catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to retrieve the user config", description: format(err) });
    throw err;
  });

export const setConfiguration = (configuration: UserSettings): Promise<UserSettings> =>
  invoke<UserSettings>("write_configuration", { configuration }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Unable to update the user config", description: format(err) });
    throw err;
  });
