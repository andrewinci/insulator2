import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./search-input";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("SearchInput", () => {
  it("should render without throwing", () => {
    const queryClient = new QueryClient();
    const { container } = render(<SearchInput />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
  });
  it("should invoke on enter after focus with meta+f", async () => {
    const user = userEvent.setup();
    const f = vi.fn();
    const queryClient = new QueryClient();
    render(<SearchInput onEnter={f} />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    await user.keyboard("{Meta>}{f}");
    await user.keyboard("{Enter}");
    expect(f).toHaveBeenCalledOnce();
  });
});
