import { renderHook } from "@testing-library/react-hooks";
import { vi, describe, it, expect } from "vitest";
import { useParsedUrl } from "./use-parsed-url";

vi.mock("../providers", () => {
  return {
    useUserSettings: vi.fn().mockReturnValue({
      userSettings: {
        clusters: [
          { id: "cluster-1", name: "Cluster 1" },
          { id: "cluster-2", name: "Cluster 2" },
        ],
      },
    }),
  };
});

describe("useParsedUrl", () => {
  it("should return the correct isModal, clusterName, clusterId and activeItem", () => {
    window.location.href = "http://localhost:9093/cluster/cluster-1/queries";
    const { result } = renderHook(() => useParsedUrl());
    expect(result.current.isModal).toEqual(false);
    expect(result.current.clusterName).toEqual("Cluster 1");
    expect(result.current.clusterId).toEqual("cluster-1");
    expect(result.current.activeItem).toEqual("queries");
  });

  it('should return the correct data when the pathname is "/modal/cluster/cluster-1/queries"', () => {
    window.location.href = "http://localhost:9093/modal/cluster/cluster-1/queries";
    const { result } = renderHook(() => useParsedUrl());

    expect(result.current.isModal).toEqual(true);
    expect(result.current.clusterId).toEqual("cluster-1");
    expect(result.current.activeItem).toEqual("queries");
  });
});
