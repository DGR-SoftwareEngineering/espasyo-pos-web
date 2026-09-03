import { renderHook, act } from "@testing-library/react";
import "../test-utils";
import { useBeforeUnload } from "../../core/hooks/useBeforeUnload";

const mockEvents = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const mockPush = jest.fn().mockResolvedValue(true);

jest.mock("../../core/router", () => ({
  useRouter: jest.fn(() => ({
    ...require("../test-utils").mockRouter(),
    push: mockPush,
    events: mockEvents,
  })),
}));

describe("useBeforeUnload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getRouteChangeStartListener = () => {
    const call = mockEvents.on.mock.calls.find(
      ([event]) => event === "routeChangeStart"
    );
    return call?.[1] as ((route: string) => void) | undefined;
  };

  it("registers routeChangeStart listener when enabled=true", () => {
    renderHook(() => useBeforeUnload(true));
    expect(mockEvents.on).toHaveBeenCalledWith(
      "routeChangeStart",
      expect.any(Function)
    );
  });

  it("does not register routeChangeStart listener when enabled=false", () => {
    renderHook(() => useBeforeUnload(false));
    expect(mockEvents.on).not.toHaveBeenCalledWith(
      "routeChangeStart",
      expect.any(Function)
    );
  });

  it("removes listener on unmount", () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));
    unmount();
    expect(mockEvents.off).toHaveBeenCalledWith(
      "routeChangeStart",
      expect.any(Function)
    );
  });

  it("calls handler and throws when handler is provided and routeChangeStart fires", () => {
    const handler = jest.fn();
    renderHook(() => useBeforeUnload(true, handler));

    const listener = getRouteChangeStartListener();

    expect(() => listener?.("/new-page")).toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("emits routeChangeError when handler is provided", () => {
    const handler = jest.fn();
    renderHook(() => useBeforeUnload(true, handler));

    const listener = getRouteChangeStartListener();
    try {
      listener?.("/new-page");
    } catch {}

    expect(mockEvents.emit).toHaveBeenCalledWith("routeChangeError");
  });

  it("does not throw when no handler is provided", () => {
    renderHook(() => useBeforeUnload(true));

    const listener = getRouteChangeStartListener();
    expect(() => listener?.("/new-page")).not.toThrow();
  });

  it("continueRoute calls router.push with the stored route", async () => {
    const { result } = renderHook(() => useBeforeUnload(true));

    const listener = getRouteChangeStartListener();
    listener?.("/target-page"); // no handler → no throw

    await act(async () => {
      await result.current.continueRoute();
    });

    expect(mockPush).toHaveBeenCalledWith("/target-page");
  });

  it("continueRoute does nothing when no route is stored", async () => {
    const { result } = renderHook(() => useBeforeUnload(true));

    await act(async () => {
      await result.current.continueRoute();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
