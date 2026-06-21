import { renderHook, act } from "@testing-library/react";
import { useFilters } from "../../core/hooks/useFilters";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "Apple", category: "fruit", price: 10 },
  { id: 2, name: "Banana", category: "fruit", price: 5 },
  { id: 3, name: "Carrot", category: "vegetable", price: 3 },
  { id: 4, name: "Daikon", category: "vegetable", price: 7 },
];

describe("useFilters", () => {
  it("returns all items when no filter is set", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "", category: "all" },
        searchKeys: ["name"],
      })
    );
    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("filters by custom filter function", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { category: "all" },
        filterFns: {
          category: (item, value) =>
            value === "all" ? true : item.category === value,
        },
      })
    );

    act(() => {
      result.current.setFilter("category", "fruit");
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map((p) => p.name)).toEqual([
      "Apple",
      "Banana",
    ]);
  });

  it("filters by searchTerm across configured searchKeys", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "" },
        searchKeys: ["name", "category"],
      })
    );

    // "fruit" appears in category for Apple and Banana
    act(() => {
      result.current.setFilter("searchTerm", "fruit");
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map((p) => p.name)).toEqual([
      "Apple",
      "Banana",
    ]);
  });

  it("resetFilters restores all items", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "" },
        searchKeys: ["name"],
      })
    );

    act(() => {
      result.current.setFilter("searchTerm", "Apple");
    });
    expect(result.current.filteredItems).toHaveLength(1);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("ignores filter when value is 'all'", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { category: "all" },
      })
    );

    act(() => {
      result.current.setFilter("category", "all");
    });

    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("ignores filter when value is empty string", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "" },
        searchKeys: ["name"],
      })
    );

    act(() => {
      result.current.setFilter("searchTerm", "");
    });

    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("returns empty when filter matches nothing", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "" },
        searchKeys: ["name"],
      })
    );

    act(() => {
      result.current.setFilter("searchTerm", "xyz");
    });

    expect(result.current.filteredItems).toHaveLength(0);
  });

  it("exposes current filter state", () => {
    const { result } = renderHook(() =>
      useFilters({
        items: products,
        defaultFilters: { searchTerm: "" },
        searchKeys: ["name"],
      })
    );

    act(() => {
      result.current.setFilter("searchTerm", "Apple");
    });

    expect(result.current.filters.searchTerm).toBe("Apple");
  });
});
