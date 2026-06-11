import React, { useMemo } from "react";
import { Box, Flex, Heading, Text, Link as RadixLink } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "../../core/router";
import { useHeaderTitleContext } from "../../core/contexts";
import { HeaderSearch } from "./menu/HeaderSearch";
import { HeaderSalesTarget } from "./menu/HeaderSalesTarget";
import { ThemeToggleButton } from "./ThemeToggleButton";

interface HeaderProps {
  /** Right-side slot (notifications, search, theme toggle, etc.). */
  endSlot?: React.ReactNode;
  /** Sticky header (default true). */
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  endSlot,
  sticky = true,
}) => {
  const router = useRouter();
  const { headerTitle } = safeHeaderTitle();

  const homeHref = (() => {
    const path = router.pathname ?? "/";
    if (path.startsWith("/cashier")) return "/cashier/pos";
    if (path.startsWith("/admin")) return "/admin/hub";
    return "/";
  })();

  const segments = useMemo(() => {
    const path = (router.asPath ?? "/").split("?")[0]?.split("#")[0] ?? "/";
    const parts = path.split("/").filter(Boolean);
    return parts.map((part, idx) => ({
      label: humanizeSegment(part),
      href: "/" + parts.slice(0, idx + 1).join("/"),
      isLast: idx === parts.length - 1,
    }));
  }, [router.asPath]);

  const pageTitle =
    headerTitle ||
    segments[segments.length - 1]?.label ||
    "Dashboard";

  return (
    <Box
      data-layout="app-header"
      style={{
        background: "var(--color-panel-solid)",
        boxShadow: "0 1px 0 var(--gray-a5)",
        padding: "12px 24px",
        flexShrink: 0,
      }}
    >
      <Flex direction="column" gap="2">
        {/* Top row — breadcrumb (left) + search (center) + user menu (right). */}
        <Flex justify="between" align="center" gap="3" style={{ minHeight: 32 }}>
          <Box style={{ flex: "0 0 auto", minWidth: 0 }}>
            {segments.length > 1 ? (
              <Flex align="center" gap="1" wrap="wrap">
                <RadixLink
                  size="1"
                  color="gray"
                  href={homeHref}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(homeHref);
                  }}
                  style={{ textDecoration: "none", cursor: "pointer" }}
                >
                  Home
                </RadixLink>
                {segments.map((seg) => (
                  <Flex key={seg.href} align="center" gap="1">
                    <ChevronRightIcon
                      width={12}
                      height={12}
                      style={{ color: "var(--gray-9)" }}
                    />
                    {seg.isLast ? (
                      <Text size="1" color="gray" weight="medium">
                        {seg.label}
                      </Text>
                    ) : (
                      <RadixLink
                        size="1"
                        color="gray"
                        href={seg.href}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(seg.href);
                        }}
                        style={{ textDecoration: "none", cursor: "pointer" }}
                      >
                        {seg.label}
                      </RadixLink>
                    )}
                  </Flex>
                ))}
              </Flex>
            ) : null}
          </Box>

          {/* Search + notifications + user menu — always renders. The search
              is unconditional so admins can navigate by typing, regardless of
              whether the user context has fully resolved yet. */}
          <Flex
            align="center"
            gap="3"
            style={{ flex: "1 1 auto", justifyContent: "flex-end", minWidth: 0 }}
          >
            <HeaderSalesTarget />
            <HeaderSearch />
            <ThemeToggleButton />
          </Flex>
        </Flex>

        {/* Title row */}
        <Flex justify="between" align="center" gap="3">
          <Heading size="6" weight="bold">
            {pageTitle}
          </Heading>
          {endSlot && (
            <Flex align="center" gap="2">
              {endSlot}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

/**
 * `useHeaderTitleContext` throws if used outside its provider. Until every
 * route is wrapped, fall back gracefully so the header still renders.
 */
function safeHeaderTitle(): { headerTitle?: string } {
  try {
    return useHeaderTitleContext();
  } catch {
    return {};
  }
}

function humanizeSegment(seg: string): string {
  // Strip dynamic-route brackets ("[id]" → "id"), then title-case.
  const clean = seg.replace(/^\[(.+)\]$/, "$1").replace(/-/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
