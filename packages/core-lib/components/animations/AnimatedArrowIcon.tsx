import { KeyboardArrowUpRounded } from "@mui/icons-material";
import { IconProps } from "@mui/material";

interface Props {
  open?: boolean;
  color?: IconProps["color"];
  size?: IconProps["fontSize"];
  width?: number;
  height?: number;
  className?: string;
}

export const AnimatedArrowIcon: React.FC<Props> = ({
  open,
  color = "primary",
  size = "large",
  width,
  height,
  className,
}) => {
  return (
    <KeyboardArrowUpRounded
      className={className}
      titleAccess={open ? "close-icon" : "open-icon"}
      fontSize={size}
      color={color}
      sx={{
        width,
        height,
        transform: `rotateX(${open ? 0 : 180}deg) !important`,
        transition: (theme) => theme.transitions.create(["transform"]),
      }}
    />
  );
};
