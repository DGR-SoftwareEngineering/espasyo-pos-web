import React, { forwardRef } from "react";
import { IconButton, IconButtonProps } from "@radix-ui/themes";

interface Props extends Omit<IconButtonProps, "size"> {
  size?: IconButtonProps["size"];
}

export const MenuButton = forwardRef<HTMLButtonElement, Props>(
  ({ size = "2", variant = "ghost", color, ...props }, ref) => (
    <IconButton
      ref={ref}
      size={size}
      variant={variant}
      color={color}
      {...props}
    />
  ),
);
