import React, { useMemo, useState, useEffect } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  IconButton,
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
  StarIcon,
} from "@radix-ui/react-icons";
import { LocalCafeOutlined, GridViewOutlined, ViewListOutlined } from "@mui/icons-material";
import {
  ProductCategoryDto,
  SellableProductDto,
  PromoDto,
} from "core-lib/api/commons/types";
import { useApi } from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";
import { formatCurrency } from "../format";
import { SELLABLE_PRODUCTS_PAGE_SIZE } from "../constants";

interface Props {
  onAdd: (product: SellableProductDto) => void;
  cartCountByProductID: Record<string, number>;
  /** Resolves the active promos a sellable product is eligible for — including category-targeted promos via BFS ancestry. */
  eligiblePromosFor?: (product: SellableProductDto) => PromoDto[];
  onPromoClick?: (product: SellableProductDto) => void;
}

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

type ViewMode = "grid" | "list";

const VIEW_MODE_KEY = "espasyo.pos.viewMode";

export const ProductGrid: React.FC<Props> = ({
  onAdd,
  cartCountByProductID,
  eligiblePromosFor,
  onPromoClick,
}) => {
  const { currencyCode, inventory, pos } = usePublicSettings();
  const [search, setSearch] = useState("");
  const [categoryID, setCategoryID] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
      if (saved === "list" || saved === "grid") setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    }
  };

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

  const categoriesCb = useApi((api) => api.commons.productCategoryList(), []);
  const items = productsCb.result?.data?.response?.items ?? [];
  const totalItems = productsCb.result?.data?.response?.totalItems ?? 0;

  const allCategories = useMemo<ProductCategoryDto[]>(
    () => categoriesCb.result?.data?.response ?? [],
    [categoriesCb.result],
  );

  // Roots — categories with no parent. Used in the top filter row.
  const rootCategories = useMemo(
    () => allCategories.filter((c) => !c.parentProductCategoryID),
    [allCategories],
  );

  // Sub-categories grouped by their parent ID. Used to render the second row
  // of chips when a root category is selected.
  const subCategoriesByRoot = useMemo(() => {
    const map = new Map<string, ProductCategoryDto[]>();
    for (const c of allCategories) {
      const pid = c.parentProductCategoryID;
      if (!pid) continue;
      const list = map.get(pid) ?? [];
      list.push(c);
      map.set(pid, list);
    }
    return map;
  }, [allCategories]);

  // Quick lookup of category by ID (handles drilling into a sub-category).
  const categoryById = useMemo(() => {
    const map = new Map<string, ProductCategoryDto>();
    for (const c of allCategories) map.set(c.productCategoryID, c);
    return map;
  }, [allCategories]);

  // The currently selected ROOT category — when a sub-category is selected,
  // this resolves up to its top-level parent for the second-row toggle.
  const selectedRootId = useMemo<string | null>(() => {
    if (!categoryID) return null;
    const cat = categoryById.get(categoryID);
    if (!cat) return null;
    return cat.parentProductCategoryID ?? cat.productCategoryID;
  }, [categoryID, categoryById]);

  const visibleSubCategories = selectedRootId
    ? subCategoriesByRoot.get(selectedRootId) ?? []
    : [];

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
          <Flex align="center" gap="2">
            <Flex
              align="center"
              gap="1"
              style={{
                border: "1px solid var(--gray-a4)",
                borderRadius: 8,
                padding: 4,
                background: "var(--color-panel-solid)",
              }}
            >
              <IconButton
                variant={viewMode === "grid" ? "solid" : "soft"}
                color={viewMode === "grid" ? "indigo" : "gray"}
                size="2"
                onClick={() => handleViewModeChange("grid")}
                aria-label="Grid view"
                title="Grid view"
              >
                <GridViewOutlined fontSize="small" />
              </IconButton>
              <IconButton
                variant={viewMode === "list" ? "solid" : "soft"}
                color={viewMode === "list" ? "indigo" : "gray"}
                size="2"
                onClick={() => handleViewModeChange("list")}
                aria-label="List view"
                title="List view"
              >
                <ViewListOutlined fontSize="small" />
              </IconButton>
            </Flex>
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
            {rootCategories.map((c) => (
              <CategoryPill
                key={c.productCategoryID}
                active={selectedRootId === c.productCategoryID}
                label={c.name}
                onClick={() => setCategoryID(c.productCategoryID)}
              />
            ))}
          </Flex>
        </ScrollArea>

        {visibleSubCategories.length > 0 && (
          <ScrollArea
            type="auto"
            scrollbars="horizontal"
            style={{ maxHeight: 36, marginTop: 8 }}
          >
            <Flex gap="2" pb="1">
              <SubCategoryPill
                active={categoryID === selectedRootId}
                label={`All ${
                  categoryById.get(selectedRootId!)?.name ?? "items"
                }`}
                onClick={() => setCategoryID(selectedRootId)}
              />
              {visibleSubCategories.map((c) => (
                <SubCategoryPill
                  key={c.productCategoryID}
                  active={categoryID === c.productCategoryID}
                  label={c.name}
                  onClick={() => setCategoryID(c.productCategoryID)}
                />
              ))}
            </Flex>
          </ScrollArea>
        )}
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
        ) : viewMode === "grid" ? (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 168px)",
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
              const promos = eligiblePromosFor?.(p) ?? [];
              const tile = (
                <ProductTile
                  product={p}
                  disabled={disabled}
                  currencyCode={currencyCode}
                  inCartCount={cartCountByProductID[p.productID] ?? 0}
                  onClick={() => onAdd(p)}
                  promos={promos}
                  onPromoClick={onPromoClick}
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
        ) : (
          <Flex direction="column" p="3" gap="2">
            {items.map((p) => {
              const disabled = p.isOutOfStock && !allowNegative;
              const tooltip = buildTileTooltip(
                p,
                pos.allowMenuItemsWithoutRecipe,
                disabled,
              );
              const promos = eligiblePromosFor?.(p) ?? [];
              const row = (
                <ProductRow
                  product={p}
                  disabled={disabled}
                  currencyCode={currencyCode}
                  inCartCount={cartCountByProductID[p.productID] ?? 0}
                  onClick={() => onAdd(p)}
                  promos={promos}
                  onPromoClick={onPromoClick}
                />
              );
              if (!tooltip) return row;
              return (
                <Tooltip key={p.productID} content={tooltip}>
                  {row}
                </Tooltip>
              );
            })}
          </Flex>
        )}
      </ScrollArea>
    </Flex>
  );
};

const ProductRow: React.FC<{
  product: SellableProductDto;
  disabled: boolean;
  currencyCode: string;
  inCartCount: number;
  onClick: () => void;
  promos: PromoDto[];
  onPromoClick?: (product: SellableProductDto) => void;
}> = ({ product, disabled, currencyCode, inCartCount, onClick, promos, onPromoClick }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--color-panel-solid)",
        border: "1px solid var(--gray-a4)",
        borderRadius: 10,
        padding: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--gray-a2)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--gray-a6)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--color-panel-solid)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--gray-a4)";
      }}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background:
            "linear-gradient(135deg, var(--gray-a3) 0%, var(--gray-a4) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--gray-9)",
          overflow: "hidden",
          flexShrink: 0,
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
          <LocalCafeOutlined style={{ fontSize: 24 }} />
        )}
      </Box>

      <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="2"
          weight="medium"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.name}
        </Text>
        {product.categoryName && (
          <Text
            size="1"
            color="gray"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontSize: 11,
            }}
          >
            {product.categoryName}
          </Text>
        )}
      </Flex>

      <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
        {promos.length > 0 && (
          <IconButton
            size="1"
            color="amber"
            variant="solid"
            onClick={(e) => {
              e.stopPropagation();
              onPromoClick?.(product);
            }}
            title="Click to view available promos"
          >
            <StarIcon width={16} height={16} />
          </IconButton>
        )}

        <Text
          size="3"
          weight="bold"
          style={{
            background:
              "linear-gradient(135deg, var(--indigo-11) 0%, var(--violet-11) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {product.sellingPrice != null
            ? formatCurrency(product.sellingPrice, currencyCode)
            : product.variants.length
              ? `from ${formatCurrency(Math.min(...product.variants.map((v) => v.price)), currencyCode)}`
              : "—"}
        </Text>

        {inCartCount > 0 && (
          <Badge
            color="indigo"
            variant="solid"
            radius="full"
            size="1"
            style={{ minWidth: 26, justifyContent: "center" }}
          >
            ×{inCartCount}
          </Badge>
        )}

        {!disabled && (
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px var(--indigo-a5)",
            }}
          >
            <PlusIcon width={16} height={16} />
          </Box>
        )}
      </Flex>
    </button>
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

const SubCategoryPill: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: "5px 12px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
      border: active ? "1px solid var(--indigo-a8)" : "1px dashed var(--gray-a5)",
      background: active ? "var(--indigo-a3)" : "transparent",
      color: active ? "var(--indigo-11)" : "var(--gray-11)",
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
  promos: PromoDto[];
  onPromoClick?: (product: SellableProductDto) => void;
}> = ({ product, disabled, currencyCode, inCartCount, onClick, promos, onPromoClick }) => {
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
        width: "100%",
        height: "100%",
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

        {/* Promo badge — bottom-left */}
        {promos.length > 0 && (
          <Box
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--amber-9) 0%, var(--orange-9) 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px var(--amber-a6)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPromoClick?.(product);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.15)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px var(--amber-a8)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 10px var(--amber-a6)";
            }}
            title="Click to view available promos"
          >
            <StarIcon width={14} height={14} />
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
            {product.sellingPrice != null
            ? formatCurrency(product.sellingPrice, currencyCode)
            : product.variants.length
              ? `from ${formatCurrency(Math.min(...product.variants.map((v) => v.price)), currencyCode)}`
              : "—"}
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
