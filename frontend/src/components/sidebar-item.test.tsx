import { IconClock } from "@tabler/icons";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SidebarItem } from "./sidebar-item";

vi.mock("react-router-dom", () => {
  return {
    useNavigate: () => {
      return vi.fn();
    },
  };
});

describe("SidebarItem", () => {
  it("should render", () => {
    const { container } = render(
      <SidebarItem icon={<IconClock />} color="red" label="label" url="url" active={false} minimized={false} />
    );
    expect(container).toBeTruthy();
  });
});
