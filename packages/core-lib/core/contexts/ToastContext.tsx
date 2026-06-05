import React, { createContext, useContext } from "react";
import { toast, ExternalToast } from "sonner";

type ToastType = "info" | "success" | "error" | "warning";

/**
 * Position values kept identical to the previous `react-toastify` API so
 * callers that pass `executeToast(msg, "top-right", false)` don't break.
 * Sonner accepts the same strings, but position is resolved at `<Toaster>`
 * level — see the note on `executeToast` below.
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Subset of legacy `react-toastify` options we keep accepting for backward
 * compatibility with existing call sites. New code should prefer `showToast`.
 */
export interface ToastOptions extends ExternalToast {
  type?: ToastType;
  toastId?: number | string;
  autoClose?: number;
}

export interface ToastContextSetup {
  /**
   * Low-level toast trigger preserved for backward compatibility.
   *
   * NOTE on sonner semantics:
   *   - `position` is honored at `<Toaster>` level (mounted in
   *     `MuiThemeFramework` / `RadixThemeFramework`), not per-toast — the
   *     parameter is accepted but ignored.
   *   - `hideProgressBar` is a no-op — sonner doesn't show a progress bar.
   *   - `toastId` is mapped to sonner's `id` so re-firing with the same id
   *     updates the existing toast in place.
   *   - `options.type` selects between `toast.info / .success / .error / .warning`.
   */
  executeToast: (
    message: string,
    position: ToastPosition,
    hideProgressBar: boolean,
    options?: ToastOptions,
  ) => void;
  /** Preferred surface for app code. */
  showToast: (message: string, type: ToastType) => void;
  /** Imperative dismiss — pass an id to dismiss one, or omit to dismiss all. */
  dismissToast: (id?: string | number) => void;
}

const ToastContext = createContext<ToastContextSetup>({} as never);

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      "useToastContext must be used inside a <ToastContextProvider>.",
    );
  }
  return ctx;
};

const dispatchByType = (
  message: string,
  type: ToastType | undefined,
  options: ExternalToast,
) => {
  switch (type) {
    case "success":
      toast.success(message, options);
      return;
    case "error":
      toast.error(message, options);
      return;
    case "warning":
      toast.warning(message, options);
      return;
    case "info":
      toast.info(message, options);
      return;
    default:
      toast(message, options);
      return;
  }
};

export const ToastContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const executeToast: ToastContextSetup["executeToast"] = (
    message,
    _position,
    _hideProgressBar,
    options = {},
  ) => {
    const { type, toastId, autoClose, ...rest } = options;
    dispatchByType(message, type, {
      id: toastId !== undefined ? String(toastId) : undefined,
      duration: autoClose,
      ...rest,
    });
  };

  const showToast: ToastContextSetup["showToast"] = (message, type) => {
    dispatchByType(message, type, { id: `app-toast-${type}` });
  };

  const dismissToast: ToastContextSetup["dismissToast"] = (id) => {
    if (id !== undefined) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return (
    <ToastContext.Provider value={{ executeToast, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};
