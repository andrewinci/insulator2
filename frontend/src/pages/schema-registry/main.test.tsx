import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SchemasPage } from "./main";
import * as schemaRegistry from "../../tauri/schema-registry";

vi.spyOn(schemaRegistry, "listSubjects");

vi.mock("../../tauri/schema-registry", () => ({
  listSubjects: () => vi.fn().mockResolvedValue(["subject1", "subject2"]),
}));

vi.mock("react-router-dom", () => ({
  useParams: vi.fn().mockReturnValue({ clusterId: "cluster-id" }),
}));

describe("SchemasPage", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(<SchemasPage />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(container).toBeTruthy();
    expect(schemaRegistry.listSubjects).toBeCalledWith("cluster-id");
  });
});
