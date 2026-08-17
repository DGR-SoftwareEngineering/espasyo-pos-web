import React from "react";
import { Box as RadixBox, type BoxProps } from "@radix-ui/themes";

type Props = BoxProps;

export const Box = React.forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    return <RadixBox ref={ref} {...props} />;
  }
);

Box.displayName = "Box";
