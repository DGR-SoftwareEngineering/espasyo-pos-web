import { forwardRef } from "react";
import { Button, ButtonProps } from "./Button";

type Props = Omit<ButtonProps, "type">;

export const TextButton = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => <Button {...props} type="Link" ref={ref} />,
);
