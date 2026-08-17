import React, { useMemo } from "react";
import { Box, Flex, Heading, Text, Link as RadixLink } from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "../../core/router";
import { useResolution } from "../../core/hooks";
import { useHeaderTitleContext } from "../../core/contexts";
import { HeaderSearch } from "./menu/HeaderSearch";
import { HeaderSalesTarget } from "./menu/HeaderSalesTarget";

interface HeaderProps {
  endSlot?: React.ReactNode;
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  endSlot,
  sticky = true,
}) => {
  const router = useRouter();
  const { isSmallMobile, isDesktop } = useResolution();
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
        padding: "12px 24px",
        flexShrink: 0,
      }}
    >
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center" gap="3" style={{ minHeight: 32 }}>
          <Box style={{ flex: "0 0 auto", minWidth: 0 }}>
            {segments.length > 1 && !isSmallMobile ? (
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

          <Flex
            align="center"
            gap="3"
            style={{ flex: "1 1 auto", justifyContent: "flex-end", minWidth: 0 }}
          >
            <HeaderSalesTarget />
            {isDesktop && <HeaderSearch />}
          </Flex>
        </Flex>

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

function safeHeaderTitle(): { headerTitle?: string } {
  try {
    return useHeaderTitleContext();
  } catch {
    return {};
  }
}

function humanizeSegment(seg: string): string {
  const clean = seg.replace(/^\[(.+)\]$/, "$1").replace(/-/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
