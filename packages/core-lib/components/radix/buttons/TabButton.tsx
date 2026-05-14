import React, { forwardRef } from "react";
import { Button as RadixButton } from "@radix-ui/themes";

interface Props {
  id?: string;
  children?: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  width?: number | string;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onFocusVisible?: React.FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  role?: React.AriaRole;
  "data-testid"?: string;
}

export const TabButton = forwardRef<HTMLButtonElement, Props>(
  (
    { id, children, active, disabled, width, className, style, ...rest },
    ref,
  ) => (
    <RadixButton
      ref={ref}
      id={id}
      data-testid={rest["data-testid"] || id}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      variant={active ? "solid" : "soft"}
      color="indigo"
      className={className}
      style={{
        minWidth: 60,
        width: width ?? 167,
        height: 42,
        borderRadius: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </RadixButton>
  ),
);
