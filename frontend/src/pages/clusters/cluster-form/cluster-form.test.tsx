import { render } from "@testing-library/react";
import { describe, vi, it, expect } from "vitest";
import { ClusterForm } from "./cluster-form";
import { ClusterFormType } from "./types";

describe("ClusterForm", () => {
  it("should render", () => {
    const { container } = render(<ClusterForm onSubmit={vi.fn()} />);
    expect(container).toBeTruthy();
  });
  it("should render SASL", () => {
    const initialValues = {
      authentication: { type: "SASL" },
    } as unknown as ClusterFormType;
    const { container } = render(<ClusterForm onSubmit={vi.fn()} initialValues={initialValues} />);
    expect(container).toBeTruthy();
  });
  it("should render SSL", () => {
    const initialValues = {
      authentication: { type: "SSL" },
    } as unknown as ClusterFormType;
    const { container } = render(<ClusterForm onSubmit={vi.fn()} initialValues={initialValues} />);
    expect(container).toBeTruthy();
  });
  it("should render JKS", () => {
    const initialValues = {
      authentication: { type: "JKS" },
    } as unknown as ClusterFormType;
    const { container } = render(<ClusterForm onSubmit={vi.fn()} initialValues={initialValues} />);
    expect(container).toBeTruthy();
  });
});
