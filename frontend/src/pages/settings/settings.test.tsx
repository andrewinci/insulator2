import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Settings } from "./settings";

describe("Settings", () => {
  it("should render", () => {
    const { container } = render(<Settings />);
    expect(container).toBeTruthy();
  });
});
