// Tauri test helpers

import { vi } from "vitest";

export const mockHelpers = () =>
  vi.mock("@tauri/helpers", () => {
    return { usePlatform: () => "darwin" };
  });
