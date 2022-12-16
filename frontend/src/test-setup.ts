import { vi } from "vitest";

//mock backend functionalities in test
vi.mock("./tauri/helpers", () => {
  return { usePlatform: () => "darwin" };
});
