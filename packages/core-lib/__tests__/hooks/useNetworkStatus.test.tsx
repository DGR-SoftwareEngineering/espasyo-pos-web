import { renderHook, act } from "@testing-library/react";
import { useNetworkStatus } from "../../core/hooks/useNetworkStatus";

describe("useNetworkStatus", () => {
  const originalOnline = Object.getOwnPropertyDescriptor(
    window.navigator,
    "onLine"
  );

  afterEach(() => {
    if (originalOnline) {
      Object.defineProperty(window.navigator, "onLine", originalOnline);
    }
    jest.clearAllTimers();
  });

  const setOnline = (value: boolean) => {
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value,
      configurable: true,
    });
  };

  it("returns isOnline reflecting navigator.onLine initial value", () => {
    setOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it("updates to true when online event fires", () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("updates to false when offline event fires", () => {
    setOnline(true);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("removes event listeners on unmount", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
