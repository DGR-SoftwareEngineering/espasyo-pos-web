import React from "react";
import { Flex as RadixFlex, type FlexProps } from "@radix-ui/themes";

type Props = FlexProps;

export const Flex: React.FC<Props> = (props) => {
  return <RadixFlex {...props} />;
};
