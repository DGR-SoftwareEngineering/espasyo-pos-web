import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Badge, Box, Card, Flex, Text, Tooltip } from "@radix-ui/themes";
import {
  ReloadIcon,
  RocketIcon,
  LightningBoltIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
} from "@mui/icons-material";
import { PesoIcon } from "core-lib/components/icons/PesoIcon";
import { useApi } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { registerForm } from "core-lib/components/radix/form/FormRenderer";
import type { DialogContentType } from "core-lib/api/content/types/common";
import { HeaderV2 } from "core-lib/components/radix/header/HeaderV2";
import { StatsCard } from "core-lib/components/radix/StatsCard";
import { FilterBar } from "core-lib/components/radix/FilterBar";
import { Button } from "core-lib/components/radix/buttons/Button";
import { RecipeList } from "./RecipeList";
import {
  DIALOG_TITLES,
  DIALOG_TYPES,
  applyRecipeSorting,
  sortOptions,
  RecipeFilterState,
} from "../constants";
import { ProductRecipeSummaryResponse, RecipeResponse } from "core-lib/api/commons/types";
import { useRecipeStats } from "../hooks";
import { RecipeForm } from "../forms/RecipeForm";
import { formatCurrency } from "core-lib/business";

registerForm("recipe-form", RecipeForm);

export const RecipeListBlock: React.FC = () => {
  const { openDialog, closeDialog } = useDialogContext();
  const router = useRouter();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<RecipeFilterState>({
    searchQuery: "",
    sortBy: "name",
  });

  const data = useApi((api) => api.commons.getProductsWithRecipeSummary());
  const response = data.result?.data.response;

  const recipes = useMemo((): ProductRecipeSummaryResponse[] => {
    return response?.items ?? [];
  }, [response]);

  const stats = useRecipeStats(recipes);

  const serverPagination = useMemo(() => {
    if (!response) return undefined;
    return {
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      totalItems: response.totalItems,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }, [response]);

  const filteredRecipes = useMemo(() => {
    let filtered = [...recipes];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.menuItemName.toLowerCase().includes(query) ||
          (recipe.recipeID ?? "").toLowerCase().includes(query) ||
          (recipe.recipeItems ?? []).some((item) =>
            item.ingredientName.toLowerCase().includes(query),
          ),
      );
    }

    return applyRecipeSorting(filtered as unknown as RecipeResponse[], filters) as ProductRecipeSummaryResponse[];
  }, [recipes, filters]);

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredRecipes.slice(start, start + pageSize);
  }, [filteredRecipes, pageNumber, pageSize]);

  const clientPagination = useMemo(
    () => ({
      pageNumber,
      totalPages: Math.ceil(filteredRecipes.length / pageSize),
      hasNextPage: pageNumber < Math.ceil(filteredRecipes.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      pageSize,
      totalItems: filteredRecipes.length,
    }),
    [filteredRecipes.length, pageNumber, pageSize],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.sortBy !== "name") count++;
    return count;
  }, [filters]);

  const selectableItems = useMemo(
    () => paginatedData.filter((r) => r.recipeID),
    [paginatedData],
  );

  const handleRefresh = useCallback(() => {
    data.execute();
    setFilters({ searchQuery: "", sortBy: "name" });
    setPageNumber(1);
    setSelectedIds(new Set());
  }, [data]);

  const handleSelectRecipe = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === selectableItems.length
        ? new Set()
        : new Set(selectableItems.map((r) => r.recipeID!)),
    );
  }, [selectableItems]);

  const handleBulkDelete = useCallback(() => {
    openDialog({
      title: `Delete ${selectedIds.size} Recipe${selectedIds.size > 1 ? "s" : ""}`,
      dialogContentType: "RecipeBulkDelete" as unknown as DialogContentType,
      data: { ids: Array.from(selectedIds), count: selectedIds.size },
      onSuccess: () => {
        setSelectedIds(new Set());
        handleRefresh();
      },
    });
  }, [selectedIds, openDialog, handleRefresh]);

  const handleView = useCallback(
    (recipe: ProductRecipeSummaryResponse) => {
      const navigateToInventory = () => {
        closeDialog();
        router.push("/admin/hub/inventory/inventory-list");
      };
      openDialog({
        title: DIALOG_TITLES.view,
        dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
        data: {
          recipe: recipe as unknown as RecipeResponse,
          onNavigateToInventory: navigateToInventory,
          variantRecipeCount: recipe.variantRecipeCount,
          addOnRecipeCount: recipe.addOnRecipeCount,
        },
        maxWidth: "xl",
      });
    },
    [openDialog, closeDialog, router],
  );

  const handleEdit = useCallback(
    (recipe: ProductRecipeSummaryResponse) => {
      if (!recipe.recipeID) return;
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: recipe as unknown as RecipeResponse,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleDelete = useCallback(
    (recipe: ProductRecipeSummaryResponse) => {
      const isVariantAddonOnly = !recipe.recipeID &&
        (recipe.variantRecipeCount > 0 || recipe.addOnRecipeCount > 0);

      if (isVariantAddonOnly) {
        openDialog({
          title: "Manage Variant & Add-On Recipes",
          dialogContentType: "RecipeVariantAddonDelete" as unknown as DialogContentType,
          data: {
            recipe: recipe as unknown as RecipeResponse,
            variantRecipeCount: recipe.variantRecipeCount,
            addOnRecipeCount: recipe.addOnRecipeCount,
          },
          onSuccess: handleRefresh,
        });
      } else if (recipe.recipeID) {
        openDialog({
          title: DIALOG_TITLES.delete,
          dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
          data: recipe as unknown as RecipeResponse,
          onSuccess: handleRefresh,
        });
      }
    },
    [openDialog, handleRefresh],
  );

  const handleNextPage = useCallback(() => {
    if (clientPagination.hasNextPage) setPageNumber((prev) => prev + 1);
  }, [clientPagination.hasNextPage]);

  const handlePreviousPage = useCallback(() => {
    if (clientPagination.hasPreviousPage) setPageNumber((prev) => prev - 1);
  }, [clientPagination.hasPreviousPage]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
    setPageNumber(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
    setPageNumber(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ searchQuery: "", sortBy: "name" });
    setPageNumber(1);
  }, []);

  return (
    <Box style={{ width: "100%" }}>
      <Card variant="surface" size="3" mb="4">
        <HeaderV2
          title="Recipe Management"
          subtitle="Create and manage your recipe catalog with ingredient compositions"
          icon={<RestaurantMenuOutlined style={{ fontSize: 28 }} />}
          actionButton={{
            label: "New Recipe",
            onClick: () => {},
            variant: "contained",
            color: "primary",
          }}
        />

        <Flex gap="3" mt="4" wrap="wrap">
          {(() => {
            const loadingVal = data.loading ? "—" : undefined;
            return (
              <>
                <StatsCard
                  label="Total Recipes"
                  value={loadingVal ?? stats.totalRecipes}
                  icon={<RestaurantMenuOutlined />}
                  color="primary"
                  variant="detailed"
                />
                <StatsCard
                  label="Total Ingredients"
                  value={loadingVal ?? stats.totalIngredients}
                  icon={<KitchenOutlined />}
                  color="success"
                  variant="detailed"
                />
                <StatsCard
                  label="Avg Ingredients"
                  value={loadingVal ?? stats.averageIngredients}
                  icon={<LocalDiningOutlined />}
                  color="info"
                  variant="detailed"
                />
                <StatsCard
                  label="Total Recipe Cost"
                  value={loadingVal ?? formatCurrency(stats.totalCost)}
                  icon={<PesoIcon />}
                  color="warning"
                  variant="detailed"
                />
              </>
            );
          })()}
        </Flex>

        {!data.loading && (stats.mostExpensive.name || stats.mostIngredients.name) && (
          <Flex gap="2" mt="3" wrap="wrap">
            {stats.mostExpensive.name && (
              <Badge color="amber" variant="soft" size="2" radius="full">
                <RocketIcon />
                Most Expensive: {stats.mostExpensive.name}
              </Badge>
            )}
            {stats.mostIngredients.name && (
              <Badge color="blue" variant="soft" size="2" radius="full">
                <LightningBoltIcon />
                Most Ingredients: {stats.mostIngredients.name}
              </Badge>
            )}
          </Flex>
        )}

        <Flex justify="between" align="center" gap="3" mt="4" wrap="wrap">
          <FilterBar
            searchValue={filters.searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search recipes by name, ID, or ingredients…"
            sortValue={filters.sortBy}
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
            resultCount={filteredRecipes.length}
            resultLabel="recipes"
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageSizeChange={handlePageSizeChange}
            activeFilterCount={activeFilterCount}
            onClearFilters={handleClearFilters}
            showFilterChip
          />
          <Flex gap="2">
            {selectedIds.size > 0 && (
              <Button type="Critical" onClick={handleBulkDelete}>
                <Flex align="center" gap="2">
                  <TrashIcon />
                  Delete Selected ({selectedIds.size})
                </Flex>
              </Button>
            )}
            <Button
              type="Secondary"
              onClick={handleRefresh}
              disabled={data.loading}
            >
              <Flex align="center" gap="2">
                <ReloadIcon />
                Refresh
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card variant="surface" size="2" style={{ overflow: "hidden" }}>
        <RecipeList
          data={paginatedData}
          loading={data.loading}
          pagination={clientPagination}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelectRecipe={handleSelectRecipe}
          onSelectAll={handleSelectAll}
        />
      </Card>

      {filteredRecipes.length > 0 && (
        <Flex justify="between" align="center" mt="3" px="2">
          <Text size="2" color="gray">
            Showing{" "}
            {filteredRecipes.length === 0
              ? 0
              : (pageNumber - 1) * pageSize + 1}{" "}
            to {Math.min(pageNumber * pageSize, filteredRecipes.length)} of{" "}
            <Text weight="bold" color="gray">
              {filteredRecipes.length}
            </Text>{" "}
            recipes
          </Text>
          <Flex align="center" gap="2">
            <Text size="2" color="gray">
              Page{" "}
              <Text weight="bold" color="gray">
                {pageNumber}
              </Text>{" "}
              of{" "}
              <Text weight="bold" color="gray">
                {clientPagination.totalPages}
              </Text>
            </Text>
            {serverPagination &&
              serverPagination.totalPages > 0 &&
              serverPagination.totalItems !== filteredRecipes.length && (
                <Tooltip content="Server-side pagination info (total items across all pages)">
                  <Badge color="blue" variant="soft" size="1">
                    Total in DB: {serverPagination.totalItems} recipes
                  </Badge>
                </Tooltip>
              )}
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
