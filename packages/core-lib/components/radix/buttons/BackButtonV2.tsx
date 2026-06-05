import React from "react";
import { Button, Text, Flex } from "@radix-ui/themes";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "../../../core/router";

interface Props {
  label: string;
  /** Where to navigate. `null` means "go back" (router.back). */
  link?: string | null;
  loading?: boolean;
  /** Bypass next/router and use native browser history. */
  isNativeBack?: boolean;
  /** Compact mode for in-page contexts (smaller text + icon). */
  isInStickOutPage?: boolean;
  onClick?: () => void;
}

export const BackButtonV2: React.FC<Props> = ({
  label,
  link,
  isNativeBack,
  isInStickOutPage,
  loading,
  onClick,
}) => {
  const router = useRouter();
  const isLoading = loading || router.loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isNativeBack) return window.history.back();
    if (onClick) return onClick();
    if (link === null) return router.back();
    if (link) router.push(link);
  };

  return (
    <Button
      variant="ghost"
      color="indigo"
      disabled={isLoading}
      onClick={handleClick}
      asChild={!!link && !isNativeBack && !onClick}
      style={{ alignItems: "center", cursor: "pointer" }}
    >
      <Flex align="center" gap="1">
        <ChevronLeftIcon
          width={isInStickOutPage ? 18 : 24}
          height={isInStickOutPage ? 18 : 24}
        />
        <Text
          size={isInStickOutPage ? "2" : "5"}
          weight={isInStickOutPage ? "bold" : "regular"}
        >
          {label}
        </Text>
      </Flex>
    </Button>
  );
};
