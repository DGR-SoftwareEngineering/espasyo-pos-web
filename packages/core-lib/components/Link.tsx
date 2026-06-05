import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import clsx from "clsx";
import { forwardRef } from "react";
import { useRouter } from "../core/router";

export type LinkProps = {
  activeClassName?: string;
  as?: NextLinkProps["as"];
  href?: NextLinkProps["href"];
  naked?: boolean;
} & Omit<MuiLinkProps, "href">;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    activeClassName = "active",
    as,
    className: classNameProps,
    href,
    naked,
    ...other
  },
  ref
) {
  const router = useRouter();
  const pathname = typeof href === "string" ? href : href?.pathname;

  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") || href.startsWith("mailto:"));

  if (isExternal) {
    return <MuiLink className={className} href={href} ref={ref} {...other} />;
  }

  return (
    <MuiLink
      component={NextLink}
      href={href ?? ""}
      as={as}
      className={className}
      ref={ref}
      {...other}
    />
  );
});
