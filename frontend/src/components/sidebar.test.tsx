import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SideBar } from "./sidebar";

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

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      name: "John Doe",
      email: "",
    },
  }),
}));

vi.mock("react-router-dom", () => {
  return {
    useNavigate: () => {
      return vi.fn();
    },
  };
});

describe("SideBar", () => {
  it("renders", () => {
    const { container } = render(<SideBar />);
    expect(container).toMatchSnapshot();
  });
});
