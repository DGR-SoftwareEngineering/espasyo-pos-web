import { createClasses } from "../../../../core/theme/custom/create-classes";
import type { LinkProps } from "@mui/material/Link";
import { mergeClasses } from "minimal-shared/utils";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import { EspasyoLogo } from "../../../../assets";
import { Box } from "@mui/material";
import Image from "next/image";
import { externalImageLoader } from "../../../../business/images";
import { useResolution } from "../../../../core/hooks";

export const logoClasses = {
  root: createClasses("logo__root"),
};

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = "/",
  isSingle = false,
  ...other
}: LogoProps) {
  const { isMobile } = useResolution();
  const singleLogo = (
    <Box
      position="relative"
      sx={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
      role="button"
    >
      <Image
        data-testid="header_logo_image"
        src={EspasyoLogo || ""}
        loader={externalImageLoader}
        key="desktop-logo"
        height={46}
        width={46}
        alt="logo-alt"
        style={{
          objectFit: "contain",
        }}
      />
    </Box>
  );

  const fullLogo = (
    <Box
      position="relative"
      sx={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
      role="button"
    >
      <Image
        data-testid="header_logo_image"
        src={EspasyoLogo || ""}
        loader={externalImageLoader}
        key="desktop-logo"
        height={46}
        width={120}
        alt="logo-alt"
        style={{
          objectFit: "contain",
        }}
      />
    </Box>
  ); //Create full logo

  return (
    <LogoRoot
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: "none" }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: "transparent",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  verticalAlign: "middle",
  width: "100%", // or a fixed width like 120px
  height: "60px", // adjust based on your sidebar height
}));
