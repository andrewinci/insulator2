import { useQuery } from "@tanstack/react-query";
import { platform } from "@tauri-apps/api/os";

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
