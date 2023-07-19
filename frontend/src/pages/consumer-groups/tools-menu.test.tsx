import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolsMenu } from "./tools-menu";

describe("ToolsMenu", () => {
  it("should render", () => {
    const { container } = render(
      <ToolsMenu
        loading={false}
        disabled={false}
        clusterId={""}
        data={{
          name: "",
          offsets: [],
        }}
        onRefresh={vi.fn()}
        onDeleteConsumerGroup={vi.fn()}
      />,
    );
    expect(container).toBeTruthy();
  });
});
