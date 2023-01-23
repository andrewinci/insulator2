import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { platform } from "@tauri-apps/api/os";
import { addNotification } from "../providers";
import { format, ApiError } from "./error";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";

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
    })
  );
  return data;
};

export const setWindowMinSize = (width: number, height: number): void => {
  appWindow.setMinSize(new LogicalSize(width, height));
};

export const setWindowTitle = (title: string): void => {
  appWindow.setTitle(title);
};

export const useAppVersion = (): string | undefined => {
  const { data: appVersion } = useQuery(["insulatorVersion"], getVersion);
  return appVersion;
};

export const parseTruststore = async (location: string, password: string | undefined): Promise<string> => {
  return await invoke<string>("parse_truststore", { location, password }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Parse truststore failed", description: format(err) });
    return Promise.reject(err);
  });
};

type UserCertificate = {
  certificate: string;
  key: string;
};

export const parseKeystore = async (location: string, password: string | undefined): Promise<UserCertificate> => {
  return await invoke<UserCertificate>("parse_keystore", { location, password }).catch((err: ApiError) => {
    addNotification({ type: "error", title: "Parse keystore failed", description: format(err) });
    return Promise.reject(err);
  });
};
