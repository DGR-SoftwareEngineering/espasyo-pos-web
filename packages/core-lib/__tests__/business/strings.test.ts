import {
  toTitleCase,
  parseDelimitedList,
  formatCurrency,
  truncateId,
  formatPrice,
  formatId,
  truncateDescription,
  caseInsensitiveEquals,
  incrementNumberInText,
  propertyToLabel,
  replaceDotsWithSpaces,
  addSpaceBeforeCapital,
} from "../../business/strings";

describe("toTitleCase", () => {
  it("converts lowercase text to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
  });
  it("handles already title-cased text", () => {
    expect(toTitleCase("Hello World")).toBe("Hello World");
  });
  it("handles all-uppercase text", () => {
    expect(toTitleCase("HELLO WORLD")).toBe("Hello World");
  });
  it("returns empty string for empty input", () => {
    expect(toTitleCase("")).toBe("");
  });
});

describe("parseDelimitedList", () => {
  it("splits a semicolon-delimited string", () => {
    expect(parseDelimitedList("a;b;c")).toEqual(["a", "b", "c"]);
  });
  it("trims whitespace from each item", () => {
    expect(parseDelimitedList("a ; b ; c")).toEqual(["a", "b", "c"]);
  });
  it("supports custom delimiter", () => {
    expect(parseDelimitedList("a,b,c", ",")).toEqual(["a", "b", "c"]);
  });
  it("returns empty array for undefined input", () => {
    expect(parseDelimitedList(undefined)).toEqual([]);
  });
  it("returns empty array for empty string", () => {
    expect(parseDelimitedList("")).toEqual([]);
  });
  it("filters out empty segments", () => {
    expect(parseDelimitedList("a;;b")).toEqual(["a", "b"]);
  });
});

describe("formatCurrency", () => {
  it("formats a positive number as PHP currency", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1,000.00");
  });
  it("returns ₱0.00 for null", () => {
    expect(formatCurrency(null)).toBe("₱0.00");
  });
  it("returns ₱0.00 for undefined", () => {
    expect(formatCurrency(undefined)).toBe("₱0.00");
  });
  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });
  it("formats decimal amounts", () => {
    const result = formatCurrency(10.5);
    expect(result).toContain("10.50");
  });
});

describe("truncateId", () => {
  it("truncates a long ID to 6 chars with ellipsis", () => {
    expect(truncateId("abcdefghijk")).toBe("abcdef...");
  });
  it("respects custom length parameter", () => {
    expect(truncateId("abcdefghijk", 4)).toBe("abcd...");
  });
  it("returns em dash for null", () => {
    expect(truncateId(null)).toBe("—");
  });
  it("returns em dash for undefined", () => {
    expect(truncateId(undefined)).toBe("—");
  });
});

describe("formatPrice", () => {
  it("formats a number to 2 decimal places", () => {
    expect(formatPrice(10.5)).toBe("10.50");
  });
  it("handles integer prices", () => {
    expect(formatPrice(100)).toBe("100.00");
  });
  it("returns 0.00 for null-like values", () => {
    expect(formatPrice(null)).toBe("0.00");
  });
  it("handles string numbers", () => {
    expect(formatPrice("25.50")).toBe("25.50");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("0.00");
  });
});

describe("formatId", () => {
  it("shows first 8 chars of a long ID with ellipsis", () => {
    expect(formatId("abcdefghijklmno")).toBe("abcdefgh...");
  });
  it("returns em dash for null", () => {
    expect(formatId(null)).toBe("—");
  });
  it("returns em dash for undefined", () => {
    expect(formatId(undefined)).toBe("—");
  });
});

describe("truncateDescription", () => {
  it("returns description as-is when under max length", () => {
    expect(truncateDescription("Short text", 50)).toBe("Short text");
  });
  it("truncates to max length with ellipsis", () => {
    const long = "a".repeat(60);
    expect(truncateDescription(long, 50)).toBe("a".repeat(50) + "...");
  });
  it("uses default max of 50", () => {
    const long = "a".repeat(60);
    expect(truncateDescription(long)).toBe("a".repeat(50) + "...");
  });
  it("returns 'No description' for null", () => {
    expect(truncateDescription(null)).toBe("No description");
  });
});

describe("caseInsensitiveEquals", () => {
  it("returns true for same string different case", () => {
    expect(caseInsensitiveEquals("Hello", "hello")).toBe(true);
  });
  it("returns true for identical strings", () => {
    expect(caseInsensitiveEquals("ABC", "ABC")).toBe(true);
  });
  it("returns false for different strings", () => {
    expect(caseInsensitiveEquals("apple", "orange")).toBe(false);
  });
  it("returns false if either argument is undefined", () => {
    expect(caseInsensitiveEquals(undefined, "hello")).toBe(false);
    expect(caseInsensitiveEquals("hello", undefined)).toBe(false);
  });
});

describe("incrementNumberInText", () => {
  it("increments a standalone number in text", () => {
    expect(incrementNumberInText("Copy 1")).toBe("Copy 2");
  });
  it("handles multiple numbers", () => {
    expect(incrementNumberInText("Item 1 of 3")).toBe("Item 2 of 4");
  });
  it("handles text with no number", () => {
    expect(incrementNumberInText("NoNumber")).toBe("NoNumber");
  });
});

describe("propertyToLabel", () => {
  it("converts camelCase to title case words", () => {
    const result = propertyToLabel("myPropertyName");
    expect(result).toBe("My Property Name");
  });
  it("handles dot-separated paths", () => {
    const result = propertyToLabel("user.firstName");
    expect(result).toContain("First");
    expect(result).toContain("Name");
  });
  it("returns empty string for empty input", () => {
    expect(propertyToLabel("")).toBe("");
  });
});

describe("replaceDotsWithSpaces", () => {
  it("replaces dots with spaces", () => {
    expect(replaceDotsWithSpaces("hello.world")).toBe("hello world");
  });
  it("handles multiple dots", () => {
    expect(replaceDotsWithSpaces("a.b.c")).toBe("a b c");
  });
});

describe("addSpaceBeforeCapital", () => {
  it("adds space before capital letter after lowercase", () => {
    expect(addSpaceBeforeCapital("camelCase")).toBe("camel Case");
  });
  it("handles multiple capitals", () => {
    expect(addSpaceBeforeCapital("firstName")).toBe("first Name");
  });
});
