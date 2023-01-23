import { vi } from "vitest";

//mock backend functionalities in test
vi.mock("./tauri/helpers", () => {
  return {
    usePlatform: () => "darwin",
    setWindowMinSize: (_: number, __: number) => {
      console.log("setWindowMinSize");
    },
    setWindowTitle: (_: string) => {
      console.log("setWindowTitle");
    },
    useAppVersion: () => "0.0.0",
  };
});
