import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddSchemaModal } from "./add-schema-modal";

describe("AddSchemaModal", () => {
  it("should render", () => {
    const { container } = render(<AddSchemaModal subjects={[]} clusterId={""} opened={false} onClose={vi.fn()} />);
    expect(container).toBeTruthy();
  });
});
