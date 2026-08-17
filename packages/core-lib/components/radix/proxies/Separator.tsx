import React from "react";
import { Separator as RadixSeparator, type SeparatorProps } from "@radix-ui/themes";

type Props = SeparatorProps;

export const Separator: React.FC<Props> = (props) => {
  return <RadixSeparator {...props} />;
};
