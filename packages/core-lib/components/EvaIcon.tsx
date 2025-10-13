import { Theme, useTheme } from "@mui/material";
import * as eva from "eva-icons";
import { useEffect } from "react";

interface Props {
  id?: string;
  name: string;
  fill?: string | ((theme: Theme) => string);
  primaryFill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  ariaHidden?: boolean;
  size?: string;
  ariaLabel?: string;
  role?: string;
}

export const EvaIcon: React.FC<Props> = ({
  id,
  name,
  fill,
  primaryFill,
  width,
  height,
  className,
  ariaHidden = false,
  ariaLabel,
  size,
  role,
}) => {
  const theme = useTheme();

  useEffect(() => {
    eva.replace();
  }, []);

  const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, "");

  return (
    <i
      id={id}
      data-eva={sanitizedName}
      data-eva-fill={getFillColor()}
      data-eva-height={height}
      data-eva-width={width}
      data-eva-size={size}
      className={className}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      role={role}
    />
  );

  function getFillColor(): string | undefined {
    if (primaryFill) {
      return theme.palette.primary.main;
    }
    if (typeof fill === "string") {
      const shouldUsePrimaryColor = fill === "#FF0000";
      return shouldUsePrimaryColor ? theme.palette.primary.main : fill;
    }
    return fill?.(theme);
  }
};
