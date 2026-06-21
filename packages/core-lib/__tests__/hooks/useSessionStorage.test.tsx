import { renderHook, act } from "@testing-library/react";
import { useSessionStorage } from "../../core/hooks/useSessionStorage";

describe("useSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns the initial value when sessionStorage is empty", () => {
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    expect(result.current[0]).toBe("initial");
  });

  it("returns stored value when sessionStorage already has a value", () => {
    sessionStorage.setItem("test-key", JSON.stringify("stored"));
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    expect(result.current[0]).toBe("stored");
  });

  it("updates value with setValue", () => {
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    act(() => {
      result.current[1]("updated");
    });
    expect(result.current[0]).toBe("updated");
  });

  it("persists value to sessionStorage on setValue", () => {
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    act(() => {
      result.current[1]("persisted");
    });
    expect(JSON.parse(sessionStorage.getItem("test-key")!)).toBe("persisted");
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() =>
      useSessionStorage<number>("count", 0)
    );
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });

  it("clearValue resets to initial value", () => {
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    act(() => {
      result.current[1]("changed");
    });
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe("initial");
  });

  it("clearValue removes item from sessionStorage", () => {
    const { result } = renderHook(() =>
      useSessionStorage("test-key", "initial")
    );
    act(() => {
      result.current[1]("stored");
    });
    act(() => {
      result.current[2]();
    });
    expect(sessionStorage.getItem("test-key")).toBeNull();
  });

  it("works with object values", () => {
    const initial = { name: "John", age: 30 };
    const { result } = renderHook(() =>
      useSessionStorage("obj-key", initial)
    );
    const updated = { name: "Jane", age: 25 };
    act(() => {
      result.current[1](updated);
    });
    expect(result.current[0]).toEqual(updated);
  });
});
