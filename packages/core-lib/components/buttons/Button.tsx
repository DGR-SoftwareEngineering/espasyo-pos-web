import {
  CircularProgress,
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import React, { forwardRef } from "react";
import { ButtonType } from "../../api/content/types/common";
import { useCustomAction } from "./hooks/useCustomAction";

export interface ButtonProps
  extends Pick<
    MuiButtonProps,
    | "className"
    | "children"
    | "fullWidth"
    | "onClick"
    | "sx"
    | "onFocusVisible"
    | "tabIndex"
    | "variant"
    | "role"
    | "onKeyDown"
  > {
  width?: number | string;
  id?: string;
  loading?: boolean;
  disabled?: boolean;
  customActionKey?: string;
  href?: string;
  type?: ButtonType;
  buttonActionType?: MuiButtonProps["type"];
  text?: string;
  disabledReason?: string;
  widthPercentage?: number;
  "data-testid"?: string;
  postRequestUrl?: string;
}

const LOADER_SIZE = 26;

/**
 * TODO: This button will be generic in the future. Add custom action keys and analytic keys
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      text,
      loading,
      disabled,
      className,
      width,
      fullWidth,
      sx,
      id,
      type,
      variant,
      disabledReason,
      onClick,
      href,
      postRequestUrl,
      buttonActionType,
      customActionKey,
      ...props
    },
    ref
  ) => {
    const action = useCustomAction({
      actionKey: customActionKey,
    });
    const isDisabledOrLoading = loading || disabled;
    const disabledReasonId = `disabledReason-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const role = !href ? { role: "button" } : {};

    const button = (
      <>
        <MuiButton
          ref={ref}
          id={id}
          data-testid={props["data-testid"] || id}
          className={[
            className,
            type,
            loading ? "loading" : null,
            disabled ? "disabled" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          sx={{
            position: "relative",
            width: fullWidth ? "100%" : width,
            minWidth: 140,
            height: "fit-content",
            borderRadius: 0,
            fontWeight: "unset",
            fontSize: "body1",
            "& #loader": {
              position: "absolute",
              left: `calc(50% - ${LOADER_SIZE / 2}px)`,
              top: `calc(50% - ${LOADER_SIZE / 2}px)`,
            },
            ...sx,
          }}
          fullWidth={fullWidth}
          disabled={false}
          aria-label={text}
          aria-disabled={isDisabledOrLoading}
          disableRipple={isDisabledOrLoading}
          aria-describedby={disabledReasonId}
          variant={variantFromType(type)}
          onClick={handleClick}
          href={href}
          type={buttonActionType}
          {...role}
          {...props}
        >
          {children || text}
          {loading && (
            <CircularProgress
              size={LOADER_SIZE}
              id="loader"
              aria-live="assertive"
              data-loading-msg={"button_loading_message"}
            />
          )}
        </MuiButton>
      </>
    );

    return button;

    async function handleClick(
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
      if (
        (e.target as HTMLAnchorElement).href?.startsWith("mailto:") ||
        (e.target as HTMLAnchorElement).href?.startsWith("tel:")
      ) {
        e.preventDefault();
        window.open((e.target as HTMLAnchorElement).href);
        return;
      }

      if (isDisabledOrLoading) {
        e.preventDefault();
        return;
      }

      if (action?.execute || onClick) {
        e.preventDefault();
        action && (await action.execute());
        !action?.disableFurtherActions && onClick && onClick(e);
      }
    }
  }
);

const variantFromType = (
  type: ButtonProps["type"]
): MuiButtonProps["variant"] => {
  switch (type) {
    case "Secondary":
    case "SecondaryDarkBG":
      return "outlined";
    case "Primary":
    case "PrimaryDarkBG":
    case "Critical":
    case "Success":
    default:
      return "contained";
  }
};
