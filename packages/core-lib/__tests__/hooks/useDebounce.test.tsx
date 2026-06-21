import { renderHook } from "@testing-library/react";
import { useDebounce } from "../../core/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("executes callback immediately when delay is undefined", () => {
    const callback = jest.fn();
    renderHook(() => useDebounce(callback, undefined, []));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("executes callback immediately when delay is 0", () => {
    const callback = jest.fn();
    renderHook(() => useDebounce(callback, 0, []));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not execute callback immediately when delay is set", () => {
    const callback = jest.fn();
    renderHook(() => useDebounce(callback, 500, []));
    expect(callback).not.toHaveBeenCalled();
  });

  it("executes callback after the specified delay", () => {
    const callback = jest.fn();
    renderHook(() => useDebounce(callback, 500, []));
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not execute before the delay has passed", () => {
    const callback = jest.fn();
    renderHook(() => useDebounce(callback, 1000, []));
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });

  it("clears the timeout on unmount before delay", () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useDebounce(callback, 500, []));
    unmount();
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });
});
