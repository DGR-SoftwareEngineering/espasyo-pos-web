import React from "react";
import { Box, Flex, Text, Heading, Badge } from "@radix-ui/themes";
import {
  PreviewBannerItem,
  PreviewBannerConfig,
} from "../../banner/types";

type BannerType = "product" | "menuItem" | "ingredient";

interface RadixBannerTypeConfig {
  /** Radix color name backing the surface. */
  color: "indigo" | "green" | "amber" | "blue" | "violet" | "red" | "gray";
  /** Optional icon rendered in the left avatar. */
  icon?: React.ReactNode;
  /** Optional icon rendered inside the price chip. */
  chipIcon?: React.ReactNode;
  chipLabelPrefix?: string;
  showCategory?: boolean;
}

interface Props {
  item: PreviewBannerItem;
  type?: BannerType;
  customConfig?: Partial<RadixBannerTypeConfig>;
  config?: PreviewBannerConfig;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  actions?: React.ReactNode;
  showPrice?: boolean;
  showCategory?: boolean;
  renderTitle?: (name: string) => React.ReactNode;
  renderPrice?: (
    formattedPrice: string,
    typeConfig: RadixBannerTypeConfig,
  ) => React.ReactNode;
}

const RADIX_TYPE_CONFIGS: Record<BannerType, RadixBannerTypeConfig> = {
  product: { color: "indigo", showCategory: true },
  menuItem: { color: "green", chipLabelPrefix: "₱", showCategory: true },
  ingredient: { color: "blue", chipLabelPrefix: "₱", showCategory: false },
};

export const PreviewBanner: React.FC<Props> = ({
  item,
  type = "product",
  customConfig,
  className,
  style,
  onClick,
  actions,
  showPrice = true,
  showCategory,
  renderTitle,
  renderPrice,
}) => {
  const typeConfig: RadixBannerTypeConfig = {
    ...RADIX_TYPE_CONFIGS[type],
    ...customConfig,
  };
  const { color, icon, chipIcon, chipLabelPrefix, showCategory: defaultShow } =
    typeConfig;

  const shouldShowCategory =
    showCategory !== undefined ? showCategory : (defaultShow ?? false);
  const hasPrice = !!item.formattedPrice && item.formattedPrice.trim().length > 0;
  const shouldShowPrice = showPrice && hasPrice;

  return (
    <Box
      className={className}
      onClick={onClick}
      style={{
        margin: "16px 24px 0",
        padding: 20,
        borderRadius: "var(--radius-4)",
        background: `var(--${color}-a2)`,
        border: `1px solid var(--${color}-a4)`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        ...style,
      }}
    >
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        <Flex align="center" gap="3">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-3)",
              background: `var(--${color}-a3)`,
              color: `var(--${color}-11)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Text
              size="1"
              color="gray"
              style={{
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {type.toUpperCase()} PREVIEW
            </Text>

            {renderTitle ? (
              renderTitle(item.name)
            ) : (
              <Heading size="4" weight="bold">
                {item.name}
              </Heading>
            )}

            {shouldShowCategory && item.category && (
              <Text size="1" color="gray">
                Category: {item.category.name}
              </Text>
            )}
          </Box>
        </Flex>

        <Flex align="center" gap="2">
          {shouldShowPrice &&
            (renderPrice ? (
              renderPrice(item.formattedPrice!, typeConfig)
            ) : (
              <Badge color={color} variant="soft" radius="medium" size="2">
                {chipIcon}
                {chipLabelPrefix
                  ? `${chipLabelPrefix}${item.formattedPrice}`
                  : item.formattedPrice}
              </Badge>
            ))}
          {actions}
        </Flex>
      </Flex>
    </Box>
  );
};
