import { showNotification } from "@mantine/notifications";
import { vi, describe, it, expect } from "vitest";
import { addNotification } from "./notification";

vi.mock("@mantine/notifications");

describe("addNotification", () => {
  it('calls showNotification with expected arguments when n.type is "ok"', () => {
    // make sure we are not in a modal to see the notification
    window.location.href = "http://localhost:9093/cluster/cluster-1/queries";
    addNotification({
      title: "title",
      description: "description",
      type: "ok",
    });

    expect(showNotification).toHaveBeenCalledWith({
      id: "titledescription",
      autoClose: 3000,
      title: "title",
      message: "description",
      color: "teal",
      icon: expect.any(Object),
    });
  });

  it('calls showNotification with expected arguments when n.type is not "ok"', () => {
    // make sure we are not in a modal to see the notification
    window.location.href = "http://localhost:9093/cluster/cluster-1/queries";
    addNotification({
      title: "title",
      description: "description",
      type: "error",
    });

    expect(showNotification).toHaveBeenCalledWith({
      id: "titledescription",
      autoClose: false,
      title: "title",
      message: "description",
      color: "red",
      icon: expect.any(Object),
    });
  });
});
