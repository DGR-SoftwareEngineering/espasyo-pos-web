import React from "react";
import { Link as RadixLink } from "@radix-ui/themes";
import { useCustomAction } from "../../buttons/hooks/useCustomAction";

interface Props {
  id?: string;
  href?: string;
  disabled?: boolean;
  text?: string | React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
  linkRef?: React.RefObject<HTMLAnchorElement>;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  customActionParams?: string;
  customActionKey?: string;
  size?: React.ComponentProps<typeof RadixLink>["size"];
  weight?: React.ComponentProps<typeof RadixLink>["weight"];
}

export const LinkButton: React.FC<Props> = ({
  id,
  href,
  disabled,
  text,
  className,
  style,
  linkRef,
  customActionParams,
  customActionKey,
  size,
  weight,
  onClick,
  ...rest
}) => {
  const action = useCustomAction({
    actionKey: customActionKey,
    params: customActionParams,
  });

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (action?.execute) await action.execute();
    if (!action?.disableFurtherActions && onClick) onClick(e);
  };

  return (
    <>
      <RadixLink
        id={id}
        ref={linkRef as never}
        href={href}
        size={size ?? "2"}
        weight={weight}
        className={className}
        style={{ whiteSpace: "nowrap", ...style }}
        onClick={handleClick}
        data-testid={rest["data-testid"] || id}
        aria-disabled={disabled}
      >
        {text}
      </RadixLink>
      {action?.node}
    </>
  );
};
