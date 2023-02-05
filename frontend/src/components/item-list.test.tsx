import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { filterTabs, ItemList } from "./item-list";

describe("filterTabs", () => {
  it("is case insensitive", () => {
    const res = filterTabs("TeSt", { all: ["tEsT"], favorites: [], recent: [] }, false);
    const resRegex = filterTabs("TeSt", { all: ["tEsT"], favorites: [], recent: [] }, true);
    expect(res.all).toStrictEqual(["tEsT"]);
    expect(resRegex.all).toStrictEqual(["tEsT"]);
  });
  it("ignores pre/post spaces", () => {
    const res = filterTabs("  TeSt  ", { all: ["tEsT"], favorites: ["tEsT"], recent: [] }, false);
    const resRegex = filterTabs("  TeSt ", { all: ["tEsT"], favorites: ["tEsT"], recent: [] }, true);
    expect(res.all).toStrictEqual(["tEsT"]);
    expect(res.favorites).toStrictEqual(["tEsT"]);
    expect(resRegex.all).toStrictEqual(["tEsT"]);
    expect(resRegex.favorites).toStrictEqual(["tEsT"]);
  });
  it("only shows favorites that are included in all", () => {
    const res = filterTabs(" ", { all: ["test"], favorites: ["test_deleted"], recent: [] }, false);
    expect(res.all).toStrictEqual(["test"]);
    expect(res.favorites).toStrictEqual([]);
  });
  it("returns tabs if the search text is empty or undefined", () => {
    const expected = { all: ["t1", "t2"], favorites: ["t2"], recent: ["t1"] };
    const res1 = filterTabs(" ", expected, false);
    const res2 = filterTabs(undefined, expected, false);
    expect(res1).toStrictEqual(expected);
    expect(res2).toStrictEqual(expected);
  });
});

describe("ItemList", () => {
  it("should render", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <ItemList
        title={""}
        listId={""}
        items={["item-1", "item-2"]}
        isLoading={false}
        favorites={[]}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onFavToggled={() => {}}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onItemSelected={() => {}}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onRefreshList={() => {}}
      />,
      {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
      }
    );

    expect(container).toBeTruthy();
  });
});
