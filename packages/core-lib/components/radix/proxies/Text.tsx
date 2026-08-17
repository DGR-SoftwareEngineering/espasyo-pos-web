import React from "react";
import { Text as RadixText, type TextProps } from "@radix-ui/themes";

type Props = TextProps;

export const Text: React.FC<Props> = ({ size, ...props }) => {
  return <RadixText size={size ?? "2"} {...props} />;
};
