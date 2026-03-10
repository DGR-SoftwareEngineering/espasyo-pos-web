import { InputProps, OutlinedInput } from "@mui/material";

export const Input = (props: InputProps, disabled?: boolean) => (
  <OutlinedInput
    fullWidth
    sx={{
      borderRadius: 0,
      position: "relative",
      "&.Mui-error fieldset": {
        borderWidth: 2,
      },
      backgroundColor: (theme) =>
        disabled ? theme.palette.grey[200] : "inherit",
      ...props.sx,
    }}
    {...props}
  />
);
