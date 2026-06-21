import {
  isTrue,
  isFalse,
  isYes,
  isFunction,
  hasMatchingParserRule,
} from "../../business/boolean";

describe("isTrue", () => {
  it("returns true for boolean true", () => {
    expect(isTrue(true)).toBe(true);
  });
  it("returns true for string 'true'", () => {
    expect(isTrue("true")).toBe(true);
  });
  it("returns true for string 'True'", () => {
    expect(isTrue("True")).toBe(true);
  });
  it("returns false for boolean false", () => {
    expect(isTrue(false)).toBe(false);
  });
  it("returns false for string 'false'", () => {
    expect(isTrue("false")).toBe(false);
  });
  it("returns false for null", () => {
    expect(isTrue(null)).toBe(false);
  });
  it("returns false for 1", () => {
    expect(isTrue(1)).toBe(false);
  });
  it("returns false for 'TRUE' (wrong case)", () => {
    expect(isTrue("TRUE")).toBe(false);
  });
});

describe("isFalse", () => {
  it("returns true for boolean false", () => {
    expect(isFalse(false)).toBe(true);
  });
  it("returns true for string 'false'", () => {
    expect(isFalse("false")).toBe(true);
  });
  it("returns true for string 'False'", () => {
    expect(isFalse("False")).toBe(true);
  });
  it("returns false for boolean true", () => {
    expect(isFalse(true)).toBe(false);
  });
  it("returns false for null", () => {
    expect(isFalse(null)).toBe(false);
  });
  it("returns false for 'FALSE' (wrong case)", () => {
    expect(isFalse("FALSE")).toBe(false);
  });
});

describe("isYes", () => {
  it("returns true for 'yes'", () => {
    expect(isYes("yes")).toBe(true);
  });
  it("returns true for 'YES'", () => {
    expect(isYes("YES")).toBe(true);
  });
  it("returns true for 'Yes please'", () => {
    expect(isYes("Yes please")).toBe(true);
  });
  it("returns false for 'no'", () => {
    expect(isYes("no")).toBe(false);
  });
  it("returns false for empty string", () => {
    expect(isYes("")).toBe(false);
  });
});

describe("isFunction", () => {
  it("returns true for a function", () => {
    expect(isFunction(() => {})).toBe(true);
  });
  it("returns true for an arrow function", () => {
    expect(isFunction(() => 42)).toBe(true);
  });
  it("returns false for an object", () => {
    expect(isFunction({})).toBe(false);
  });
  it("returns false for a string", () => {
    expect(isFunction("hello")).toBe(false);
  });
  it("returns false for null", () => {
    expect(isFunction(null)).toBe(false);
  });
  it("returns false for a number", () => {
    expect(isFunction(42)).toBe(false);
  });
});

describe("hasMatchingParserRule", () => {
  it("returns true for [[modal:...]] pattern", () => {
    expect(hasMatchingParserRule("[[modal:some text]]")).toBe(true);
  });
  it("returns true for [[tooltip:...]] pattern", () => {
    expect(hasMatchingParserRule("[[tooltip:info]]")).toBe(true);
  });
  it("returns true for [[button:...]] pattern", () => {
    expect(hasMatchingParserRule("[[button:Click me]]")).toBe(true);
  });
  it("returns true for [[timer:...]] pattern", () => {
    expect(hasMatchingParserRule("Click here [[timer:30]]")).toBe(true);
  });
  it("returns true for [[icon:...]] pattern", () => {
    expect(hasMatchingParserRule("[[icon:star]]")).toBe(true);
  });
  it("returns true for [[badge:...]] pattern", () => {
    expect(hasMatchingParserRule("[[badge:new]]")).toBe(true);
  });
  it("returns true for [[message:...]] pattern", () => {
    expect(hasMatchingParserRule("[[message:hello]]")).toBe(true);
  });
  it("returns false for regular text without patterns", () => {
    expect(hasMatchingParserRule("This is just plain text")).toBe(false);
  });
  it("returns false for empty string", () => {
    expect(hasMatchingParserRule("")).toBe(false);
  });
  it("returns false for similar but incorrect pattern", () => {
    expect(hasMatchingParserRule("[[unknown:value]]")).toBe(false);
  });
});
