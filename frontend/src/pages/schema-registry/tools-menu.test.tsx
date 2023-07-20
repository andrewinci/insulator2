import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolsMenu } from "./tools-menu";

describe("ToolsMenu", () => {
  it("should render", () => {
    const { container } = render(
      <ToolsMenu
        clusterId={""}
        subject={""}
        version={0}
        currentSchema={""}
        onSubjectDeleted={vi.fn()}
        compatibility="FULL"
        onSubjectUpdated={vi.fn()}
      />,
    );
    expect(container).toBeTruthy();
  });
});
