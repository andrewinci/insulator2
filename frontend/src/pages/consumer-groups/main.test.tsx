import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsumerGroupsPage } from "./main";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn().mockReturnValue({ clusterId: "cluster-id" }),
}));

describe("ConsumerGroupsPage", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(<ConsumerGroupsPage />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
  });
});
