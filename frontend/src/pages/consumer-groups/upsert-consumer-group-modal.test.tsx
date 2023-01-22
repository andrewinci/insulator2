import { describe, expect, it } from "vitest";
import { mapOffset } from "./upsert-consumer-group-modal";

describe("mapOffset", () => {
  it("should map offset", () => {
    expect(mapOffset({ offset: "Beginning", date: null, time: null })).toBe("Beginning");
    expect(mapOffset({ offset: "End", date: null, time: null })).toBe("End");
  });
});
