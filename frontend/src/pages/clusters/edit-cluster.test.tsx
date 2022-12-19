import { it, describe, vi } from "vitest";
import { render } from "@testing-library/react";
import { EditCluster } from "./edit-cluster";

describe("editCluster", () => {
  it("should render", () => {
    render(<EditCluster clusterId="123" onSubmit={vi.fn()} />);
  });
});
