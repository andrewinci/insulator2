import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { platform } from "@tauri-apps/api/os";
import { withNotifications } from "./error";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";
import { notifyFailure, notifySuccess } from "../helpers/notification";
import { fs } from "@tauri-apps/api";
import { save } from "@tauri-apps/api/dialog";

type Platform = "linux" | "darwin" | "win";

export const usePlatform = (): Platform | undefined => {
  const { data } = useQuery(["currentPlatform"], () =>
    platform().then((os) => {
      switch (os) {
        case "darwin":
          return "darwin";
        case "ios":
          return "darwin";
        case "win32":
          return "win";
        default:
          return "linux";
      }
    }),
  );
  return data;
};

export const setWindowMinSize = (width: number, height: number): void => {
  if (!appWindow.isFullscreen()) appWindow.setMinSize(new LogicalSize(width, height));
};

export const setWindowTitle = (title: string): void => {
  appWindow.setTitle(title);
};

export const useAppVersion = (): string | undefined => {
  const { data: appVersion } = useQuery(["insulatorVersion"], getVersion);
  return appVersion;
};

export const parseTruststore = (location: string, password: string | undefined): Promise<string> =>
  withNotifications({ action: () => invoke<string>("parse_truststore", { location, password }) });

type UserCertificate = {
  certificate: string;
  key: string;
};

export const parseKeystore = (location: string, password: string | undefined): Promise<UserCertificate> =>
  withNotifications({ action: () => invoke<UserCertificate>("parse_keystore", { location, password }) });

export const exportDatastore = async (clusterId: string, outputPath: string): Promise<void> =>
  await withNotifications({
    action: () =>
      invoke<void>("export_datastore", {
        clusterId,
        outputPath,
      }),
    successDescription: `Database successfully exported to ${outputPath}`,
    showInModal: true,
  });

export const saveTextFile = async (subject: string, schema: string) => {
  const path = await save({
    defaultPath: `${subject}.json`,
  });
  if (path) {
    try {
      await fs.writeTextFile(path, schema);
      notifySuccess(`Schema saved to ${path}`, undefined, true);
    } catch (err) {
      notifyFailure("Unable to save the schema locally", JSON.stringify(err));
    }
  }
};
