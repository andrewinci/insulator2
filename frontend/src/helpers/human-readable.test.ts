import { it, describe, expect } from "vitest";
import { parseBytesToHumanReadable, parseMsToHumanReadable } from "./human-readable";

describe("parseMsToHumanReadable", () => {
  it("parse positive and negative entities", () => {
    expect(parseMsToHumanReadable(1)).toBe("");
    expect(parseMsToHumanReadable(0)).toBe("");
    expect(parseMsToHumanReadable(2_000)).toBe("(~ 2.00 seconds)");
    expect(parseMsToHumanReadable(-2_000)).toBe("(~ -2.00 seconds)");
    expect(parseMsToHumanReadable(-200_000)).toBe("(~ -3.33 minutes)");
    expect(parseMsToHumanReadable(200_000)).toBe("(~ 3.33 minutes)");
    expect(parseMsToHumanReadable(-50_000_000)).toBe("(~ -13.89 hours)");
    expect(parseMsToHumanReadable(50_000_000)).toBe("(~ 13.89 hours)");
    expect(parseMsToHumanReadable(-50_000_000_000)).toBe("(~ -578.70 days)");
    expect(parseMsToHumanReadable(50_000_000_000)).toBe("(~ 578.70 days)");
    expect(parseMsToHumanReadable(Number.MAX_VALUE)).toBe("");
  });
});

describe("parseBytesToHumanReadable", () => {
  it("parse positive and negative entities", () => {
    expect(parseBytesToHumanReadable(0)).toBe("");
    expect(parseBytesToHumanReadable(120)).toBe("");
    expect(parseBytesToHumanReadable(-120)).toBe("");
    expect(parseBytesToHumanReadable(600)).toBe("(~ 0.60 KB)");
    expect(parseBytesToHumanReadable(-600)).toBe("(~ -0.60 KB)");
    expect(parseBytesToHumanReadable(6_702)).toBe("(~ 6.70 KB)");
    expect(parseBytesToHumanReadable(-6_709)).toBe("(~ -6.71 KB)");
    expect(parseBytesToHumanReadable(670_900)).toBe("(~ 0.67 MB)");
    expect(parseBytesToHumanReadable(-670_900)).toBe("(~ -0.67 MB)");
    expect(parseBytesToHumanReadable(670_900_000)).toBe("(~ 0.67 GB)");
    expect(parseBytesToHumanReadable(-670_900_000)).toBe("(~ -0.67 GB)");
  });
});
