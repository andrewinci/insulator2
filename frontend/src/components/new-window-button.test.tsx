import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewWindowButton, useWindowHandler } from "./new-window-button";

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

vi.mock("@tauri-apps/api/window", () => {
  class WebviewWindow {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor(_0: string, _1: unknown) {}
    static getByLabel = (label: string) => {
      if (label === "existing_window/") {
        return new WebviewWindow(label, {});
      }
      return null;
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setFocus = () => {};
    once = (_: string, cb: () => void) => {
      cb();
    };
  }
  return { WebviewWindow };
});

describe("NewWindowButton", () => {
  it("should render", () => {
    const { container } = render(<NewWindowButton url={""} windowTitle={""} />);
    expect(container).toBeTruthy();
  });
});

describe("useWindowHandler", () => {
  it("should return the isModal and openNewWindow", () => {
    const { result } = renderHook(() => useWindowHandler());
    expect(result.current.isModal).toBeDefined();
    expect(result.current.openNewWindow).toBeDefined();
  });

  it("should call the beforeOpen, open a new window and call the afterOpen", () => {
    const beforeOpen = vi.fn();
    const afterOpen = vi.fn();
    const { result } = renderHook(() => useWindowHandler());
    result.current.openNewWindow({
      url: "https://google.com",
      windowTitle: "Google",
      beforeOpen,
      afterOpen,
    });
    expect(beforeOpen).toHaveBeenCalled();
    // You can check if the window is open or not by checking the WebviewWindow.getByLabel(url)
    expect(afterOpen).toHaveBeenCalled();
  });

  it("should not call the beforeOpen and afterOpen if the window is already open", () => {
    const beforeOpen = vi.fn();
    const afterOpen = vi.fn();
    const { result } = renderHook(() => useWindowHandler());
    result.current.openNewWindow({
      url: "existing_window",
      windowTitle: "Google",
      beforeOpen,
      afterOpen,
    });
    expect(beforeOpen).toHaveBeenCalledTimes(0);
    expect(afterOpen).toHaveBeenCalledTimes(0);
  });
});
