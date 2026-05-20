import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  ScrollArea,
  Spinner,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { LocalCafeOutlined } from "@mui/icons-material";
import {
  CategoryDataList,
  SellableProductDto,
} from "core-lib/api/commons/types";
import { useApi } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";
import { formatCurrency } from "../format";
import { SELLABLE_PRODUCTS_PAGE_SIZE } from "../constants";

interface Props {
  onAdd: (product: SellableProductDto) => void;
  cartCountByProductID: Record<string, number>;
}

const RECIPE_LIST_PATH = "/admin/hub/product/recipe/recipe-list";

const buildTileTooltip = (
  product: SellableProductDto,
  allowMenuItemsWithoutRecipe: boolean,
  disabled: boolean,
): string | null => {
  if (product.noRecipeConfigured) {
    return allowMenuItemsWithoutRecipe
      ? "No recipe configured — sales of this item won't deduct ingredient stock."
      : "No recipe configured. Add a recipe to sell this item, or have an admin enable 'Allow Menu Items Without Recipe' in settings.";
  }
  if (product.isProducedFromRecipe && product.bottleneckIngredientNames?.length > 0) {
    const names = product.bottleneckIngredientNames.join(", ");
    if (product.isOutOfStock) return `Out of stock — bottleneck: ${names}.`;
    if (product.isLowStock) return `Low stock — bottleneck: ${names}.`;
  }
  if (disabled) {
    return "Out of stock. Receive inventory or have an admin enable 'Allow Negative Stock' in settings to sell anyway.";
  }
  return null;
};

export const ProductGrid: React.FC<Props> = ({ onAdd, cartCountByProductID }) => {
  const { currencyCode, inventory, pos } = usePublicSettings();
  const [search, setSearch] = useState("");
  const [categoryID, setCategoryID] = useState<string | null>(null);

  const productsCb = useApi(
    (api) =>
      api.commons.sellableProductList({
        pageNumber: 1,
        pageSize: SELLABLE_PRODUCTS_PAGE_SIZE,
        search: search.trim() || undefined,
        categoryID: categoryID ?? undefined,
      }),
    [search, categoryID],
  );

  const categoriesCb = useApi((api) => api.commons.categoryList(), []);
  const items = productsCb.result?.data?.response?.items ?? [];
  const totalItems = productsCb.result?.data?.response?.totalItems ?? 0;

  const menuCategories = useMemo(() => {
    const list = (categoriesCb.result?.data?.response ??
      []) as CategoryDataList[];
    return list.filter((c) => c.type === 1);
  }, [categoriesCb.result]);

  const allowNegative = inventory.allowNegativeStock;
  const outOfStockCount = useMemo(
    () => items.filter((i) => i.isOutOfStock).length,
    [items],
  );
  const showOutWarning =
    !allowNegative && items.length > 0 && outOfStockCount === items.length;

  return (
    <Flex
      direction="column"
      style={{
        height: "100%",
        minHeight: 0,
        background: "var(--color-panel-solid)",
        borderRadius: 20,
        border: "1px solid var(--gray-a4)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
      }}
    >
      <Box
        p="4"
        style={{
          borderBottom: "1px solid var(--gray-a4)",
          background:
            "linear-gradient(180deg, var(--color-panel-solid) 0%, var(--gray-a2) 100%)",
        }}
      >
        <Flex align="center" gap="3" wrap="wrap" mb="3">
          <Box style={{ flex: 1, minWidth: 280 }}>
            <TextField.Root
              size="3"
              placeholder="Search products by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              radius="large"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height={18} width={18} />
              </TextField.Slot>
              {productsCb.loading && (
                <TextField.Slot>
                  <Spinner />
                </TextField.Slot>
              )}
            </TextField.Root>
          </Box>
          <Flex
            align="center"
            gap="2"
            px="3"
            py="1"
            style={{
              border: "1px solid var(--gray-a4)",
              borderRadius: 999,
              background: "var(--color-panel-solid)",
            }}
          >
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "var(--green-9)",
                boxShadow: "0 0 0 3px var(--green-a4)",
              }}
            />
            <Text size="1" color="gray" weight="medium">
              {productsCb.loading
                ? "Loading menu…"
                : `${items.length} of ${totalItems} products`}
            </Text>
          </Flex>
        </Flex>

        <ScrollArea
          type="auto"
          scrollbars="horizontal"
          style={{ maxHeight: 44 }}
        >
          <Flex gap="2" pb="1">
            <CategoryPill
              active={categoryID === null}
              label="All items"
              onClick={() => setCategoryID(null)}
            />
            {menuCategories.map((c) => (
              <CategoryPill
                key={c.categoryID}
                active={categoryID === c.categoryID}
                label={c.name}
                onClick={() => setCategoryID(c.categoryID)}
              />
            ))}
          </Flex>
        </ScrollArea>
      </Box>

      {showOutWarning && (
        <Box px="4" pt="3">
          <Callout.Root color="amber" variant="surface" size="1">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              Every product shows as <strong>Out of stock</strong>. Receive
              inventory via procurement, or have an admin enable{" "}
              <strong>Allow Negative Stock</strong> under Settings → Inventory
              to ring sales without inventory.
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      <ScrollArea
        type="auto"
        scrollbars="vertical"
        style={{ flex: 1, minHeight: 0 }}
      >
        {items.length === 0 && !productsCb.loading ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="2"
            style={{ minHeight: 240, padding: 24, opacity: 0.55 }}
          >
            <LocalCafeOutlined style={{ fontSize: 52 }} />
            <Text size="3" weight="medium">
              No products match
            </Text>
            <Text size="1" color="gray">
              Try a different search or category.
            </Text>
          </Flex>
        ) : (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
              gap: 12,
              padding: 16,
            }}
          >
            {items.map((p) => {
              const disabled = p.isOutOfStock && !allowNegative;
              const tooltip = buildTileTooltip(
                p,
                pos.allowMenuItemsWithoutRecipe,
                disabled,
              );
              const tile = (
                <ProductTile
                  product={p}
                  disabled={disabled}
                  currencyCode={currencyCode}
                  inCartCount={cartCountByProductID[p.productID] ?? 0}
                  onClick={() => onAdd(p)}
                />
              );
              if (!tooltip) {
                return (
                  <React.Fragment key={p.productID}>{tile}</React.Fragment>
                );
              }
              return (
                <Tooltip key={p.productID} content={tooltip}>
                  <Box>{tile}</Box>
                </Tooltip>
              );
            })}
          </Box>
        )}
      </ScrollArea>
    </Flex>
  );
};

const CategoryPill: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: "8px 18px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: "nowrap",
      border: active ? "1px solid transparent" : "1px solid var(--gray-a5)",
      background: active
        ? "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 100%)"
        : "var(--color-panel-solid)",
      color: active ? "white" : "var(--gray-12)",
      boxShadow: active ? "0 4px 12px var(--indigo-a5)" : "none",
      transition: "all 0.15s ease",
    }}
  >
    {label}
  </button>
);

const ProductTile: React.FC<{
  product: SellableProductDto;
  disabled: boolean;
  currencyCode: string;
  inCartCount: number;
  onClick: () => void;
}> = ({ product, disabled, currencyCode, inCartCount, onClick }) => {
  const inCart = inCartCount > 0;
  const showNoRecipeBadge = product.noRecipeConfigured;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        position: "relative",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-panel-solid)",
        border: `1px solid ${
          inCart
            ? "var(--indigo-a8)"
            : showNoRecipeBadge
              ? "var(--orange-a6)"
              : product.isLowStock && !product.isOutOfStock
                ? "var(--amber-a6)"
                : "var(--gray-a4)"
        }`,
        borderRadius: 14,
        padding: 0,
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
        boxShadow: inCart
          ? "0 4px 14px var(--indigo-a4)"
          : "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.transform =
            "translateY(-3px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            inCart
              ? "0 8px 22px var(--indigo-a6)"
              : "0 10px 22px rgba(15, 23, 42, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = inCart
          ? "0 4px 14px var(--indigo-a4)"
          : "0 1px 2px rgba(15, 23, 42, 0.04)";
      }}
    >
      <Box
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1",
          background:
            "linear-gradient(135deg, var(--gray-a3) 0%, var(--gray-a4) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gray-9)",
          overflow: "hidden",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <LocalCafeOutlined style={{ fontSize: 44 }} />
        )}

        {/* Bottom gradient overlay for image legibility */}
        {product.imageUrl && (
          <Box
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 40,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* In-cart count badge — top-left */}
        {inCart && (
          <Box
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              minWidth: 26,
              height: 26,
              padding: "0 8px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 100%)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px var(--indigo-a6)",
            }}
          >
            ×{inCartCount}
          </Box>
        )}

        {/* Stock / recipe badge — top-right. noRecipeConfigured takes priority since it's an admin-actionable config gap. */}
        {(showNoRecipeBadge || product.isLowStock || product.isOutOfStock) && (
          <Box style={{ position: "absolute", top: 8, right: 8 }}>
            {showNoRecipeBadge ? (
              <Badge color="orange" variant="solid" radius="full" size="1">
                No recipe
              </Badge>
            ) : (
              <Badge
                color={product.isOutOfStock ? "red" : "amber"}
                variant="solid"
                radius="full"
                size="1"
              >
                {product.isOutOfStock ? "Out" : "Low"}
              </Badge>
            )}
          </Box>
        )}

        {/* Quick-add icon overlay on hover, bottom-right */}
        {!disabled && (
          <Box
            className="pos-tile-add"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "white",
              color: "var(--indigo-11)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.2)",
              opacity: 0,
              transform: "scale(0.8)",
              transition: "all 0.18s ease",
              pointerEvents: "none",
            }}
          >
            <PlusIcon width={18} height={18} />
          </Box>
        )}
      </Box>

      <Flex direction="column" gap="1" p="3" style={{ flex: 1 }}>
        <Text
          size="2"
          weight="bold"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.4em",
            lineHeight: 1.25,
            color: "var(--gray-12)",
          }}
        >
          {product.name}
        </Text>
        {product.categoryName && (
          <Text
            size="1"
            color="gray"
            style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
          >
            {product.categoryName}
          </Text>
        )}
        <Flex justify="between" align="baseline" mt="1">
          <Text
            size="4"
            weight="bold"
            style={{
              background:
                "linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-11) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            {formatCurrency(product.sellingPrice, currencyCode)}
          </Text>
          {!product.isOutOfStock && (
            <Text size="1" color="gray">
              {product.stockUnitName}
            </Text>
          )}
        </Flex>
      </Flex>

      {/* Hover-reveal style for the quick-add chip */}
      <style>{`
        button:hover .pos-tile-add { opacity: 1 !important; transform: scale(1) !important; }
      `}</style>
    </button>
  );
};
