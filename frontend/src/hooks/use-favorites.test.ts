import { renderHook } from "@testing-library/react-hooks";
import { describe, it, expect, vi } from "vitest";

const setUserSettingsMock = vi.fn();

vi.doMock("../providers", () => {
  return {
    useUserSettings: vi.fn().mockReturnValue({
      userSettings: {
        clusters: [
          {
            id: "cluster-1",
            name: "Cluster 1",
            favorites: {
              topics: ["query-1"],
              consumers: [],
              schemas: [],
            },
          },
        ],
      },
      setUserSettings: setUserSettingsMock,
    }),
  };
});

import { useFavorites } from "./use-favorites";

describe("useFavorites", () => {
  it("should return the favorites and toggleFavorite", () => {
    const { result } = renderHook(() => useFavorites("cluster-1", "topics"));
    expect(result.current.favorites).toEqual(["query-1"]);
    expect(result.current.toggleFavorite).toBeDefined();
  });

  it("should add item to favorites when toggleFavorite is called", () => {
    setUserSettingsMock.mockReset();
    const { result } = renderHook(() => useFavorites("cluster-1", "consumers"));
    result.current.toggleFavorite("query-1");
    expect(setUserSettingsMock).toBeCalledTimes(1);
  });
});
