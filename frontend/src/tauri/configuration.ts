import { invoke } from "@tauri-apps/api";
import { UserSettings } from "../models";
import { withNotifications } from "./error";

export const getConfiguration = (): Promise<UserSettings> =>
  withNotifications(() => invoke<UserSettings>("get_configuration"), "User configurations loaded");

export const setConfiguration = (configuration: UserSettings): Promise<UserSettings> =>
  withNotifications(
    () => invoke<UserSettings>("write_configuration", { configuration }),
    "User configurations updated"
  );
