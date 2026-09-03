import React from "react";
import { Heading as RadixHeading, type HeadingProps } from "@radix-ui/themes";

type Props = HeadingProps;

export const Heading: React.FC<Props> = ({ size, ...props }) => {
  return <RadixHeading size={size ?? "4"} {...props} />;
};
