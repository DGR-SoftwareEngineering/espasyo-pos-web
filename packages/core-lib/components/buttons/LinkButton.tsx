import { Link, LinkProps, SxProps } from "@mui/material";
import { Theme } from "@mui/material/styles";
import React from "react";

interface Props extends Omit<LinkProps, "onClick"> {
  disabled?: boolean;
  text?: string | React.ReactNode;
  "data-testid"?: string;
  sx?: SxProps<Theme>;
  linkRef?: React.RefObject<HTMLAnchorElement>;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => void;
}

export const LinkButton: React.FC<Props> = ({
  id,
  width,
  disabled,
  href,
  onClick,
  text,
  sx,
  linkRef,
  ...props
}) => {
  return (
    <>
      <Link
        id={id}
        ref={linkRef}
        data-testid={props["data-testid"] || id}
        width={width}
        component={disabled ? "button" : "a"}
        variant="body1"
        disabled={disabled}
        href={href}
        onClick={handleClick}
        fontSize={props.fontSize}
        fontWeight="unset"
        sx={{
          ...sx,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Link>
    </>
  );

  async function handleClick(
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>
  ) {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  }
};
