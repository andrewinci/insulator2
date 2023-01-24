import { describe, expect, test } from "vitest";
import { Cluster, UserSettings } from "../../../models";
import { upsertCluster } from "./upsert-cluster";

describe("upsertCluster", () => {
  test("updates an existing cluster", () => {
    const s = {
      clusters: [
        { id: 1, name: "cluster1", favorites: [] },
        { id: 2, name: "cluster2", favorites: [] },
      ],
    } as unknown as UserSettings;
    const cluster = { id: 1, name: "updatedCluster1", favorites: [] } as unknown as Cluster;
    const updatedSettings = upsertCluster(s, cluster);
    expect(updatedSettings.clusters).toEqual([
      { id: 1, name: "updatedCluster1", favorites: [] },
      { id: 2, name: "cluster2", favorites: [] },
    ]);
  });

  test("inserts a new cluster", () => {
    const s = {
      clusters: [
        { id: 1, name: "cluster1", favorites: [] },
        { id: 2, name: "cluster2", favorites: [] },
      ],
    } as unknown as UserSettings;
    const cluster = { id: 3, name: "newCluster", favorites: [] } as unknown as Cluster;
    const updatedSettings = upsertCluster(s, cluster);
    expect(updatedSettings.clusters).toEqual([
      { id: 1, name: "cluster1", favorites: [] },
      { id: 2, name: "cluster2", favorites: [] },
      { id: 3, name: "newCluster", favorites: [] },
    ]);
  });
});
