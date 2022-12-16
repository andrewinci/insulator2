import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { ResizableModal } from "./resizable-modal";

describe("ResizableModal", () => {
  it("should render without exceptions", () => {
    render(
      <ResizableModal title="Test" onClose={vi.fn()} opened={false}>
        <p>Content</p>
      </ResizableModal>
    );
  });
});
