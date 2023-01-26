import { it, describe, vi, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { EditCluster } from "./edit-cluster";
import { mapClusterToForm, mapFormToCluster } from "./helpers";
import { Button } from "@mantine/core";

vi.mock("./cluster-form", () => ({
  ClusterForm: (props: { onSubmit: () => void }) => <Button onClick={props.onSubmit}>Submit</Button>,
}));

vi.mock("./helpers", () => ({
  mapClusterToForm: vi.fn(),
  mapFormToCluster: vi.fn(),
  upsertCluster: vi.fn(),
}));

vi.mock("../../providers", () => ({
  useUserSettings: () => ({
    userSettings: {
      clusters: [{ id: "123" }],
    },
    setUserSettings: vi.fn((_) => Promise.resolve()),
  }),
  useNotifications: () => ({
    alert: vi.fn(),
    success: vi.fn(),
  }),
}));

describe("editCluster", () => {
  it("should render", () => {
    render(<EditCluster clusterId="123" onSubmit={vi.fn()} />);
    expect(mapClusterToForm).toHaveBeenCalledOnce();
  });

  it("update the user settings on submit", async () => {
    const { findAllByText } = render(<EditCluster clusterId="123" onSubmit={vi.fn()} />);
    const button = (await findAllByText("Submit"))[0];
    fireEvent.click(button);
    expect(mapFormToCluster).toHaveBeenCalledOnce();
  });
});
