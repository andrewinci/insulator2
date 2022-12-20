import { it, describe, vi } from "vitest";
import { render } from "@testing-library/react";
import { AddNewCluster } from "./add-new-cluster";

describe("addNewCluster", () => {
  it("should render", () => {
    render(<AddNewCluster onSubmit={vi.fn()} />);
  });
});
