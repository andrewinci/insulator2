import { Accordion } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsumerGroup, ConsumerGroupTopicDetails } from "./consumer-group";

describe("ConsumerGroup", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(<ConsumerGroup clusterId={""} name={""} onDeleteConsumerGroup={vi.fn()} />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
  });
});

describe("ConsumerGroupTopicDetails", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <ConsumerGroupTopicDetails
        clusterId={""}
        topicName="topicName"
        offsets={[
          { partition: 0, offset: 0 },
          { partition: 1, offset: 10 },
        ]}
      />,
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            <Accordion>{children}</Accordion>
          </QueryClientProvider>
        ),
      }
    );
    expect(container).toBeTruthy();
  });
});
