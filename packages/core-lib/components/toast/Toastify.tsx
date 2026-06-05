import React from "react";
import { Toaster, ToasterProps } from "sonner";

/**
 * Position values kept compatible with the previous `react-toastify`-backed
 * `Toastify` so callers in `MuiThemeFramework` and `RadixThemeFramework` keep
 * compiling without changes. Sonner accepts the same strings.
 */
type ToastPosition = NonNullable<ToasterProps["position"]>;

interface ToastProps {
  position?: ToastPosition;
  /**
   * Default auto-close duration, in milliseconds. Maps to sonner's `duration`
   * prop. Match the previous react-toastify default of 5000ms.
   */
  autoClose: number;
  /**
   * Preserved for prop-API parity. Sonner doesn't render a per-toast progress
   * bar, so this is a no-op.
   */
  hideProgressBar: boolean;
  /** Light / dark / system. Defaults to "system". */
  theme?: ToasterProps["theme"];
  /** When true, color-code success / error / info / warning backgrounds. */
  richColors?: boolean;
  /** Show a close (×) button on each toast. */
  closeButton?: boolean;
}

/**
 * Replaces the previous `react-toastify` `<ToastContainer>`. Sonner's `<Toaster>`
 * mounts a single floating region; `useToastContext().showToast(...)` queues
 * messages into it via the `toast()` API.
 *
 * Sonner-specific defaults that improve the previous UX:
 *   - `richColors`: tinted backgrounds per severity (matches the look of the
 *     react-toastify themed pills)
 *   - `closeButton`: explicit × on each toast — better a11y than relying on
 *     `closeOnClick`
 */
export const Toastify: React.FC<ToastProps> = ({
  position = "top-right",
  autoClose,
  theme = "system",
  richColors = true,
  closeButton = true,
}) => (
  <Toaster
    position={position}
    duration={autoClose}
    theme={theme}
    richColors={richColors}
    closeButton={closeButton}
    visibleToasts={5}
  />
);
