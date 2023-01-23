import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../hooks", () => {
  return {
    useParsedUrl: () => {
      return {
        isModal: true,
        clusterName: "cluster-name",
        clusterId: "cluster-id",
        activeItem: "active-item",
      };
    },
  };
});

import { NewWindowButton } from "./new-window-button";

describe("NewWindowButton", () => {
  it("should render", () => {
    const { container } = render(<NewWindowButton url={""} windowTitle={""} />);
    expect(container).toBeTruthy();
  });
});
