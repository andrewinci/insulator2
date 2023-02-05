import { it, describe, vi, expect } from "vitest";
import { render } from "@testing-library/react";
import { ClusterList } from "./cluster-list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("clusterList", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(<ClusterList clusters={[]} onClusterDelete={vi.fn} onClusterSelected={vi.fn} />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
  });
});
