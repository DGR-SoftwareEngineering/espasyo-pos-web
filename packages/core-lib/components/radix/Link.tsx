import { forwardRef } from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { Link as RadixLink, LinkProps as RadixLinkProps } from "@radix-ui/themes";
import { useRouter } from "../../core/router";
import { cn } from "./_utils";

export type LinkProps = {
  activeClassName?: string;
  as?: NextLinkProps["as"];
  href?: NextLinkProps["href"];
  /** When `true`, strip Radix Link visual styling (renders as a plain anchor element via Slot). */
  naked?: boolean;
} & Omit<RadixLinkProps, "href">;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    activeClassName = "active",
    as,
    className: classNameProp,
    href,
    naked,
    children,
    ...other
  },
  ref,
) {
  const router = useRouter();
  const pathname = typeof href === "string" ? href : href?.pathname;

  const isActive = pathname === router.pathname;
  const className = cn(classNameProp, isActive && activeClassName);

  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") || href.startsWith("mailto:"));

  if (isExternal) {
    return (
      <RadixLink
        ref={ref}
        href={href}
        className={className}
        underline={naked ? "none" : undefined}
        {...other}
      >
        {children}
      </RadixLink>
    );
  }

  return (
    <RadixLink
      asChild
      className={className}
      underline={naked ? "none" : undefined}
      {...other}
    >
      <NextLink href={href ?? ""} as={as} ref={ref as never}>
        {children}
      </NextLink>
    </RadixLink>
  );
});
