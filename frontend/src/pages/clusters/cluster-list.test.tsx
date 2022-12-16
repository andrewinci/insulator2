import { it, describe, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ClusterList, containsAllWords } from "./cluster-list";

describe("clusterList", () => {
  it("should render", () => {
    vi.stubGlobal("useQuery", { data: true });
    render(<ClusterList clusters={[]} onClusterDelete={vi.fn} onClusterSelected={vi.fn} />);
  });
});

describe("containsAllWords", () => {
  it("should return false if no word is contained in the text", () => {
    expect(containsAllWords("a b c", "d e f") == false);
    expect(containsAllWords("ab cd-ed", "cd-ef") == false);
    expect(containsAllWords("", "a") == false);
  });
  it("should return true if all searched words are contained in the text", () => {
    expect(containsAllWords("a b c", "a"));
    expect(containsAllWords("ab cd-ed", "a"));
    expect(containsAllWords("ab cd-ed", "ab cd ed"));
    expect(containsAllWords("ab cd - ed", "ab cd ed"));
  });
  it("should ignore casing", () => {
    expect(containsAllWords("a b c", "A B C"));
    expect(containsAllWords("ab cd-ed", "AC") == false);
  });
});
