import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api";
import { platform } from "@tauri-apps/api/os";
import { addNotification } from "../providers";
import { format, TauriError } from "./error";

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

export const parseTruststore = async (location: string, password: string | undefined): Promise<string> => {
  return await invoke<string>("parse_truststore", { location, password }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Parse truststore failed", description: format(err) });
    return Promise.reject(err);
  });
};

type UserCertificate = {
  certificate: string;
  key: string;
};

export const parseKeystore = async (location: string, password: string | undefined): Promise<UserCertificate> => {
  return await invoke<UserCertificate>("parse_keystore", { location, password }).catch((err: TauriError) => {
    addNotification({ type: "error", title: "Parse keystore failed", description: format(err) });
    return Promise.reject(err);
  });
};
