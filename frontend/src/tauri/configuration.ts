import { invoke } from "@tauri-apps/api";
import { UserSettings } from "../models";
import { withNotifications } from "./error";

export const getConfiguration = (): Promise<UserSettings> =>
  withNotifications({
    action: () => invoke<UserSettings>("get_configuration"),
    successTitle: "User configurations loaded",
  });

export const setConfiguration = (configuration: UserSettings): Promise<UserSettings> =>
  withNotifications({
    action: () => invoke<UserSettings>("write_configuration", { configuration }),
    successTitle: "User configurations updated",
  });
