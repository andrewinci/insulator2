import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MinimizeButton } from "./minimize-button";

describe("MinimizeButton", () => {
  it("should render", () => {
    const { container } = render(<MinimizeButton minimizeTarget="sidebar" minimized={false} onClick={vi.fn()} />);
    expect(container).toBeTruthy();
  });
});
