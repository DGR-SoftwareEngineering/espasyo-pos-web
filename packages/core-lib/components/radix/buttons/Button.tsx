import React, { forwardRef } from "react";
import { Button as RadixButton, Spinner } from "@radix-ui/themes";
import { ButtonType } from "../../../api/content/types/common";
import { useCustomAction } from "../../buttons/hooks/useCustomAction";
import { resolveAccent } from "../_utils";

type RadixButtonProps = React.ComponentProps<typeof RadixButton>;

export interface ButtonProps {
  type?: ButtonType;
  variant?: RadixButtonProps["variant"];
  size?: RadixButtonProps["size"];
  className?: string;
  id?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  customActionKey?: string;
  href?: string;
  buttonActionType?: "button" | "submit" | "reset";
  text?: string;
  disabledReason?: string;
  "data-testid"?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    text,
    type = "Primary",
    variant,
    size = "2",
    className,
    id,
    loading,
    disabled,
    fullWidth,
    customActionKey,
    href,
    buttonActionType,
    disabledReason,
    onClick,
    style,
    ...rest
  },
  ref,
) {
  const action = useCustomAction({ actionKey: customActionKey });
  const isDisabledOrLoading = !!loading || !!disabled || !!action?.loading;

  const { variant: resolvedVariant, color } = mapTypeToRadix(type, variant);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabledOrLoading) {
      e.preventDefault();
      return;
    }
    const canExecuteAction = typeof action?.execute === "function";
    if (canExecuteAction || onClick) {
      e.preventDefault();
      if (canExecuteAction) await action!.execute();
      if (!canExecuteAction || !action?.disableFurtherActions) onClick?.(e);
    }
  };

  const button = (
    <RadixButton
      ref={ref}
      id={id}
      type={buttonActionType ?? "button"}
      variant={resolvedVariant}
      color={color}
      size={size}
      disabled={isDisabledOrLoading}
      aria-disabled={isDisabledOrLoading}
      aria-label={text}
      aria-describedby={disabledReason ? `${id ?? "btn"}-reason` : undefined}
      data-testid={rest["data-testid"] || id}
      className={className}
      onClick={handleClick}
      style={{
        ...(fullWidth ? { width: "100%" } : {}),
        ...style,
      }}
    >
      {loading ? <Spinner loading /> : null}
      {children ?? text}
    </RadixButton>
  );

  if (href) {
    return (
      <a
        href={href}
        style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}
        aria-disabled={isDisabledOrLoading}
      >
        {button}
      </a>
    );
  }

  return button;
});

function mapTypeToRadix(
  type: ButtonType,
  override?: RadixButtonProps["variant"],
): { variant: RadixButtonProps["variant"]; color: RadixButtonProps["color"] } {
  if (override) return { variant: override, color: defaultColorFor(type) };

  switch (type) {
    case "Primary":
      return { variant: "solid", color: resolveAccent("primary") };
    case "PrimaryDarkBG":
      return { variant: "soft", color: resolveAccent("primary") };
    case "Secondary":
      return { variant: "outline", color: resolveAccent("primary") };
    case "SecondaryDarkBG":
      return { variant: "outline", color: resolveAccent("primary") };
    case "Critical":
      return { variant: "solid", color: "red" };
    case "Success":
      return { variant: "solid", color: "green" };
    case "Link":
      return { variant: "ghost", color: resolveAccent("primary") };
    case "ButtonWithIcon":
      return { variant: "soft", color: resolveAccent("primary") };
    default:
      return { variant: "solid", color: resolveAccent("primary") };
  }
}

function defaultColorFor(type: ButtonType): RadixButtonProps["color"] {
  if (type === "Critical") return "red";
  if (type === "Success") return "green";
  return resolveAccent("primary");
}
