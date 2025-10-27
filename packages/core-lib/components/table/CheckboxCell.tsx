import { CheckboxProps } from "@mui/material";
import { Checkbox } from "../Checkbox";

export const CheckboxCell: React.FC<CheckboxProps> = ({
  sx = {},
  onClick,
  ...props
}) => (
  <Checkbox
    {...props}
    onClick={onClick}
    inputProps={{ "aria-label": props.title }}
    sx={{
      padding: 0,
      marging: 1,
      width: 24,
      height: 24,
      "& svg": { width: 24, height: 24 },
      ...sx,
    }}
  />
);
