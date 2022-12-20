import { it, describe, vi } from "vitest";
import { render } from "@testing-library/react";
import { ClusterList } from "./cluster-list";

describe("clusterList", () => {
  it("should render", () => {
    vi.stubGlobal("useQuery", { data: true });
    render(<ClusterList clusters={[]} onClusterDelete={vi.fn} onClusterSelected={vi.fn} />);
  });
});
