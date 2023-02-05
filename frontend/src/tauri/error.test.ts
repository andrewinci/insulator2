import { withNotifications } from "./error";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifyFailure, notifySuccess } from "../helpers/notification";

vi.mock("../helpers/notification");

describe("withNotifications", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls action and returns its result if no error is thrown", async () => {
    const action = vi.fn().mockReturnValue(Promise.resolve(42));
    const result = await withNotifications({
      action,
      successTitle: "Success",
      successDescription: "Action completed",
    });
    expect(result).toBe(42);
    expect(action).toHaveBeenCalled();
  });

  it('calls addNotification with type "ok" and provided success title/description when action succeeds', async () => {
    const action = vi.fn().mockReturnValue(Promise.resolve(42));
    await withNotifications({
      action,
      successTitle: "Success",
      successDescription: "Action completed",
    });
    expect(notifySuccess).toHaveBeenCalledWith("Success", "Action completed", undefined);
  });

  it('calls addNotification with type "error" and error message when action throws', async () => {
    const action = vi.fn().mockReturnValue(Promise.reject({ errorType: "Error", message: "Test error" }));
    try {
      await withNotifications({ action, successTitle: "Success", successDescription: "Action completed" });
    } catch (err) {
      /* empty */
    }
    expect(notifyFailure).toHaveBeenCalledWith("Error", "Test error");
  });

  it("returns rejected Promise with error when action throws", async () => {
    const error = new Error("Test error");
    const action = vi.fn().mockReturnValue(Promise.reject(error));
    try {
      await withNotifications({
        action,
        successTitle: "Success",
        successDescription: "Action completed",
      });
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it("calls console.error with the error when action throws", async () => {
    const error = { errorType: "Error", message: "Test error" };
    const action = vi.fn().mockReturnValue(Promise.reject(error));
    const spy = vi.spyOn(console, "error");
    try {
      await withNotifications({
        action,
        successTitle: "Success",
        successDescription: "Action completed",
      });
    } catch (err) {
      /* empty */
    }
    expect(spy).toHaveBeenCalledWith(error);
  });

  it("does not call addNotification with success title/description when they are not provided", async () => {
    const action = vi.fn().mockReturnValue(Promise.resolve(42));
    await withNotifications({ action });
    expect(notifyFailure).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
  });
});
