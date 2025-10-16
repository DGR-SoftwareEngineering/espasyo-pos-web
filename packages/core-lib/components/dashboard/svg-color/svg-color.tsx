import { mergeClasses } from "minimal-shared/utils";
import { createClasses } from "../../../core/theme/custom/create-classes";
import { styled, SxProps, Theme } from "@mui/material/styles";

export type SvgColorProps = React.ComponentProps<"span"> & {
  src: string;
  sx?: SxProps<Theme>;
};

export const svgColorClasses = {
  root: createClasses("svg__color__root"),
};

export function SvgColor({ src, className, sx, ...other }: SvgColorProps) {
  return (
    <SvgRoot
      className={mergeClasses([svgColorClasses.root, className])}
      sx={[
        {
          mask: `url(${src}) no-repeat center / contain`,
          WebkitMask: `url(${src}) no-repeat center / contain`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

const SvgRoot = styled("span")(() => ({
  width: 24,
  height: 24,
  flexShrink: 0,
  display: "inline-flex",
  backgroundColor: "currentColor",
}));
