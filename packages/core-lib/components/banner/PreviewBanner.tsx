import React from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import {
  BannerTypeConfig,
  PreviewBannerConfig,
  PreviewBannerItem,
} from "./types";
import {
  DEFAULT_CONFIG,
  INGREDIENT_CONFIG,
  MENU_ITEM_CONFIG,
  PRODUCT_CONFIG,
} from "./constants";

interface Props {
  item: PreviewBannerItem;
  type?: "product" | "menuItem" | "ingredient";
  customConfig?: Partial<BannerTypeConfig>;
  config?: PreviewBannerConfig;
  className?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
  actions?: React.ReactNode;
  showPrice?: boolean;
  showCategory?: boolean;
  renderTitle?: (name: string) => React.ReactNode;
  renderPrice?: (
    formattedPrice: string,
    typeConfig: BannerTypeConfig,
  ) => React.ReactNode;
}

export const PreviewBanner: React.FC<Props> = ({
  item,
  type = "product",
  customConfig,
  config = {},
  className,
  sx,
  onClick,
  actions,
  showPrice = true,
  showCategory,
  renderTitle,
  renderPrice,
}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    bgOpacity,
    borderOpacity,
    borderRadius,
    iconSize,
    iconContainerSize,
    spacing,
  } = mergedConfig;

  const typeConfig = React.useMemo(() => {
    let baseConfig: BannerTypeConfig;

    switch (type) {
      case "menuItem":
        baseConfig = MENU_ITEM_CONFIG;
        break;
      case "ingredient":
        baseConfig = INGREDIENT_CONFIG;
        break;
      case "product":
      default:
        baseConfig = PRODUCT_CONFIG;
    }

    return { ...baseConfig, ...customConfig };
  }, [type, customConfig]);

  const {
    icon: Icon,
    chipIcon: ChipIcon,
    color,
    chipLabelPrefix,
    showCategory: defaultShowCategory,
  } = typeConfig;

  const shouldShowCategory =
    showCategory !== undefined ? showCategory : (defaultShowCategory ?? false);
  const hasPrice = item.formattedPrice && item.formattedPrice.trim().length > 0;
  const shouldShowPrice = showPrice && hasPrice;

  const handleClick = onClick ? () => onClick() : undefined;

  const defaultTitleRender = (name: string) => (
    <Typography variant="h6" fontWeight={600}>
      {name}
    </Typography>
  );

  const defaultPriceRender = (
    formattedPrice: string,
    config: BannerTypeConfig,
  ) => (
    <Chip
      icon={<ChipIcon sx={{ fontSize: iconSize * 0.9 }} />}
      label={
        chipLabelPrefix ? `${chipLabelPrefix}${formattedPrice}` : formattedPrice
      }
      size="small"
      sx={{
        bgcolor: (theme) => alpha(theme.palette[config.color].main, 0.1),
        color: (theme) => theme.palette[config.color].main,
        fontWeight: 600,
        borderRadius: 2,
        "& .MuiChip-icon": {
          color: (theme) => theme.palette[config.color].main,
        },
      }}
    />
  );

  return (
    <Box
      className={className}
      onClick={handleClick}
      sx={{
        mx: 4,
        mt: 3,
        p: 2.5,
        borderRadius,
        bgcolor: (theme) => alpha(theme.palette[color].main, bgOpacity),
        border: (theme) =>
          `1px solid ${alpha(theme.palette[color].main, borderOpacity)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                `0 4px 12px ${alpha(theme.palette[color].main, 0.15)}`,
            }
          : {},
        ...sx,
      }}
    >
      <Stack direction="row" spacing={spacing} alignItems="center">
        <Box
          sx={{
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            sx={{
              color: (theme) => theme.palette[color].main,
              fontSize: iconSize,
            }}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {type.toUpperCase()} PREVIEW
          </Typography>

          {renderTitle ? renderTitle(item.name) : defaultTitleRender(item.name)}

          {shouldShowCategory && item.category && (
            <Typography variant="caption" color="text.secondary">
              Category: {item.category.name}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        {shouldShowPrice &&
          (renderPrice
            ? renderPrice(item.formattedPrice!, typeConfig)
            : defaultPriceRender(item.formattedPrice!, typeConfig))}
        {actions}
      </Stack>
    </Box>
  );
};
