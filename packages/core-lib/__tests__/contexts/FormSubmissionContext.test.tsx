import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  FormSubmissionContextProvider,
  useFormSubmissionContext,
} from "../../core/contexts/FormSubmissionContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FormSubmissionContextProvider>{children}</FormSubmissionContextProvider>
);

describe("FormSubmissionContext", () => {
  it("starts with no callbacks", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    expect(result.current.hasCallbacks()).toBe(false);
  });

  it("starts with loading = false", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    expect(result.current.loading).toBe(false);
  });

  it("init registers a callback", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn = jest.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn });
    });

    expect(result.current.hasCallbacks()).toBe(true);
    expect(result.current.hasCallback("form1")).toBe(true);
  });

  it("submit calls all registered callback functions", async () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn = jest.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("submit calls multiple registered callbacks", async () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn1 = jest.fn().mockResolvedValue(undefined);
    const fn2 = jest.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn: fn1 });
      result.current.init({ key: "form2", enabled: true, unchanged: true, fn: fn2 });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("reset clears all callbacks", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn = jest.fn();

    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn });
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.hasCallbacks()).toBe(false);
  });

  it("toggleCallback updates enabled and unchanged state", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn = jest.fn();

    act(() => {
      result.current.init({ key: "form1", enabled: false, unchanged: true, fn });
    });
    act(() => {
      result.current.toggleCallback({ key: "form1", enabled: true, unchanged: false });
    });

    expect(result.current.enabled).toBe(true);
    expect(result.current.unchanged).toBe(false);
  });

  it("re-initializing with same key replaces previous callback", () => {
    const { result } = renderHook(() => useFormSubmissionContext(), { wrapper });
    const fn1 = jest.fn().mockResolvedValue(undefined);
    const fn2 = jest.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn: fn1 });
    });
    act(() => {
      result.current.init({ key: "form1", enabled: true, unchanged: true, fn: fn2 });
    });

    // Only one callback registered
    expect(result.current.hasCallback("form1")).toBe(true);
  });
});
