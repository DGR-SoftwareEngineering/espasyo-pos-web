import {
  toSelectOptionsWithField,
  toUnitOptions,
  findLongestArrayInArray,
  replaceCharacter,
} from "../../business/array";

describe("toSelectOptionsWithField", () => {
  it("maps array items to select options", () => {
    const items = [
      { id: "1", name: "Apple" },
      { id: "2", name: "Banana" },
    ];
    const options = toSelectOptionsWithField(items, "id", "name");
    expect(options).toEqual([
      { value: "1", label: "Apple" },
      { value: "2", label: "Banana" },
    ]);
  });

  it("uses 'name' as default label field", () => {
    const items = [{ id: "1", name: "Test" }];
    const options = toSelectOptionsWithField(items, "id");
    expect(options[0]?.label).toBe("Test");
  });

  it("returns empty array for empty input", () => {
    expect(toSelectOptionsWithField([], "id", "name")).toEqual([]);
  });

  it("returns empty array for non-array input", () => {
    expect(toSelectOptionsWithField(null as any, "id", "name")).toEqual([]);
  });

  it("converts non-string values to string", () => {
    const items = [{ id: 42, name: "Item" }];
    const options = toSelectOptionsWithField(items, "id", "name");
    expect(options[0]?.value).toBe("42");
  });
});

describe("toUnitOptions", () => {
  it("filters to only type=3 items and maps to options", () => {
    const units = [
      { categoryID: "u1", name: "kg", type: 3 },
      { categoryID: "u2", name: "pcs", type: 1 },
      { categoryID: "u3", name: "liters", type: 3 },
    ] as any[];
    const options = toUnitOptions(units);
    expect(options).toEqual([
      { value: "u1", label: "kg" },
      { value: "u3", label: "liters" },
    ]);
  });

  it("returns empty array when no type=3 items", () => {
    const units = [
      { categoryID: "u1", name: "pcs", type: 1 },
    ] as any[];
    expect(toUnitOptions(units)).toEqual([]);
  });
});

describe("findLongestArrayInArray", () => {
  it("returns the longest nested array", () => {
    const arrays = [[1, 2, 3], [1, 2], [1, 2, 3, 4]];
    expect(findLongestArrayInArray(arrays)).toEqual([1, 2, 3, 4]);
  });

  it("returns first array when all have equal length", () => {
    const arrays = [[1, 2], [3, 4]];
    expect(findLongestArrayInArray(arrays).length).toBe(2);
  });

  it("returns empty array for empty outer array", () => {
    expect(findLongestArrayInArray([])).toEqual([]);
  });

  it("handles single-element outer array", () => {
    const arrays = [[1, 2, 3]];
    expect(findLongestArrayInArray(arrays)).toEqual([1, 2, 3]);
  });
});

describe("replaceCharacter", () => {
  it("replaces a character in a property at the given index", () => {
    const arr = [{ name: "hello-world" }];
    const result = replaceCharacter(arr, "name", 0, "-", " ");
    expect(result[0]?.name).toBe("hello world");
  });

  it("returns the array unchanged for empty input", () => {
    const result = replaceCharacter([], "name", 0, "-", " ");
    expect(result).toEqual([]);
  });

  it("does not modify if key does not exist", () => {
    const arr = [{ name: "hello" }];
    const result = replaceCharacter(arr, "nonExistentKey", 0, "h", "x");
    expect(result[0]?.name).toBe("hello");
  });
});
