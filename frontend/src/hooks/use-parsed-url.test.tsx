import { renderHook } from "@testing-library/react-hooks";
import { MemoryRouter } from "react-router-dom";
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
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/cluster/cluster-1/queries"]}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useParsedUrl(), { wrapper });
    expect(result.current.isModal).toEqual(false);
    expect(result.current.clusterName).toEqual("Cluster 1");
    expect(result.current.clusterId).toEqual("cluster-1");
    expect(result.current.activeItem).toEqual("queries");
  });

  it('should return the correct data when the pathname is "/modal/cluster/cluster-1/queries"', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/modal/cluster/cluster-1/queries"]}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useParsedUrl(), { wrapper });

    expect(result.current.isModal).toEqual(true);
    expect(result.current.clusterId).toEqual("cluster-1");
    expect(result.current.activeItem).toEqual("queries");
  });
});
