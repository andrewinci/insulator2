import { render, screen } from "@testing-library/react";
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
  it("should render the disable certificate verification checkbox", () => {
    render(<ClusterForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Disable certificate verification")).toBeTruthy();
  });
  it("should render the disable certificate verification checkbox unchecked by default", () => {
    render(<ClusterForm onSubmit={vi.fn()} />);
    const checkbox = screen.getByLabelText("Disable certificate verification") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });
  it("should render the disable certificate verification checkbox checked when initialValues has it true", () => {
    const initialValues = {
      authentication: { type: "None" },
      schemaRegistry: {
        endpoint: "localhost:8081",
        username: "",
        password: "",
        disableCertificateVerification: true,
      },
    } as unknown as ClusterFormType;
    render(<ClusterForm onSubmit={vi.fn()} initialValues={initialValues} />);
    const checkbox = screen.getByLabelText("Disable certificate verification") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
