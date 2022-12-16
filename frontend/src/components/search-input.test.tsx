import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("should render without throwing", () => {
    render(<SearchInput />);
  });
  it("should invoke on enter after focus with meta+f", async () => {
    const user = userEvent.setup();
    const f = vi.fn();
    render(<SearchInput onEnter={f} />);
    await user.keyboard("{Meta>}{f}");
    await user.keyboard("{Enter}");
    expect(f).toHaveBeenCalledOnce();
  });
});
