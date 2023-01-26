import { useEffect } from "react";
import { render } from "@testing-library/react";
import { UserSettingsProvider, useUserSettings } from "./user-settings-provider";
import { vi, describe, it, expect } from "vitest";
import { getConfiguration, setConfiguration } from "../tauri/configuration";

vi.mock("../tauri/configuration", () => {
  return {
    getConfiguration: vi.fn(() =>
      Promise.resolve({
        theme: "light",
        language: "en",
      })
    ),
    setConfiguration: vi.fn((_) => Promise.resolve()),
  };
});

describe("UserSettingsProvider", () => {
  it("should retrieve the config on mount", async () => {
    const { findByText } = render(
      <UserSettingsProvider>
        <div>Hello</div>
      </UserSettingsProvider>
    );

    await findByText("Hello");
    expect(getConfiguration).toHaveBeenCalled();
  });

  it("should update the config and state", () => {
    const Test = () => {
      const { setUserSettings } = useUserSettings();
      useEffect(() => {
        setUserSettings((s) => ({ ...s, theme: "Dark" }));
      }, []);

      return <p>Test</p>;
    };

    render(
      <UserSettingsProvider>
        <Test />
      </UserSettingsProvider>
    );

    expect(setConfiguration).toHaveBeenCalledOnce();
  });
});
