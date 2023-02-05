import { showNotification } from "@mantine/notifications";
import { vi, describe, it, expect } from "vitest";
import { addNotification } from "./notification";

vi.mock("@mantine/notifications");

describe("addNotification", () => {
  it('calls showNotification with expected arguments when n.type is "ok"', () => {
    addNotification({
      title: "title",
      description: "description",
      type: "ok",
    });

    expect(showNotification).toHaveBeenCalledWith({
      id: "description",
      autoClose: 3000,
      title: "title",
      message: "description",
      color: "teal",
      icon: expect.any(Object),
    });
  });

  it('calls showNotification with expected arguments when n.type is not "ok"', () => {
    addNotification({
      title: "title",
      description: "description",
      type: "error",
    });

    expect(showNotification).toHaveBeenCalledWith({
      id: "description",
      autoClose: false,
      title: "title",
      message: "description",
      color: "red",
      icon: expect.any(Object),
    });
  });
});
