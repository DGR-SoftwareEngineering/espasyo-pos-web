import { renderHook, act } from "@testing-library/react";
import { useModal } from "../../core/hooks/useModal";

describe("useModal", () => {
  it("starts with isOpen false", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.props.isOpen).toBe(false);
  });

  it("starts with context undefined", () => {
    const { result } = renderHook(() => useModal<string>());
    expect(result.current.props.context).toBeUndefined();
  });

  it("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    expect(result.current.props.isOpen).toBe(true);
  });

  it("open(context) stores context in props", () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => {
      result.current.open("my-context");
    });
    expect(result.current.props.context).toBe("my-context");
    expect(result.current.props.isOpen).toBe(true);
  });

  it("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });
    expect(result.current.props.isOpen).toBe(false);
  });

  it("close() clears the context", () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => {
      result.current.open("my-context");
    });
    act(() => {
      result.current.close();
    });
    expect(result.current.props.context).toBeUndefined();
  });

  it("open() without context does not overwrite existing context", () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => {
      result.current.open("initial");
    });
    act(() => {
      result.current.open(); // no context
    });
    expect(result.current.props.context).toBe("initial");
    expect(result.current.props.isOpen).toBe(true);
  });

  it("works with object context", () => {
    const { result } = renderHook(() => useModal<{ id: number; name: string }>());
    const data = { id: 1, name: "Test" };
    act(() => {
      result.current.open(data);
    });
    expect(result.current.props.context).toEqual(data);
  });
});
