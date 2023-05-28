import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mapOffset, UpsertConsumerGroupModal } from "./upsert-consumer-group-modal";

describe("mapOffset", () => {
  it("should map offset", () => {
    expect(mapOffset({ offset: "Beginning", date: null, time: null })).toBe("Beginning");
    expect(mapOffset({ offset: "End", date: null, time: null })).toBe("End");
  });
});

vi.mock("../../tauri/admin", () => ({
  useAdmin: () => ({
    setConsumerGroup: vi.fn(),
  }),

  listTopics: vi.fn().mockResolvedValue(["topic1", "topic2"]),
}));

describe("UpsertConsumerGroupModal", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(<UpsertConsumerGroupModal clusterId="cluster" onClose={vi.fn()} />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
  });
});
