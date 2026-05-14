import React, { useState, useMemo, useCallback } from "react";
import { Badge, Box, Card, Flex, Text, Tooltip } from "@radix-ui/themes";
import {
  ReloadIcon,
  RocketIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";
import {
  RestaurantMenuOutlined,
  AttachMoney,
  KitchenOutlined,
  LocalDiningOutlined,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { useDialogContext } from "core-lib";
import { registerForm } from "core-lib/components/form/FormRenderer";
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
import { RecipeResponse } from "core-lib/api/commons/types";
import { useRecipeStats } from "../hooks";
import { RecipeForm } from "../forms/RecipeForm";
import { formatCurrency } from "core-lib/business";

registerForm("recipe-form", RecipeForm);

export const RecipeListBlock: React.FC = () => {
  const { openDialog } = useDialogContext();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<RecipeFilterState>({
    searchQuery: "",
    sortBy: "name",
  });

  const calcCb = useApiCallback(
    async (api, menuItemProductId: string) =>
      await api.commons.calculateMaxProduction(menuItemProductId),
  );
  const data = useApi((api) => api.commons.getRecipe());
  const response = data.result?.data.response;

  const recipes = useMemo((): RecipeResponse[] => {
    return response?.items ?? [];
  }, [response]);

  console.log('recipes', recipes);
  const stats = useRecipeStats(recipes);

  console.log('stats', stats)

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
          recipe.recipeID.toLowerCase().includes(query) ||
          recipe.recipeItems.some((item) =>
            item.ingredientName.toLowerCase().includes(query),
          ),
      );
    }

    return applyRecipeSorting(filtered, filters);
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

  const handleRefresh = useCallback(() => {
    data.execute();
    setFilters({ searchQuery: "", sortBy: "name" });
    setPageNumber(1);
  }, [data]);

  const handleView = useCallback(
    async (recipe: RecipeResponse) => {
      try {
        const result = await calcCb.execute(recipe.menuItemProductID);
        if (!calcCb.loading && result.data.success) {
          openDialog({
            title: DIALOG_TITLES.view,
            dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
            data: {
              recipe: recipe,
              productionCapacity: result.data.response,
            },
            loading: calcCb.loading,
          });
        }
      } catch (error) {
        console.error("Failed to fetch production capacity:", error);
        openDialog({
          title: DIALOG_TITLES.view,
          dialogContentType: DIALOG_TYPES.view as unknown as DialogContentType,
          data: {
            recipe: recipe,
            productionCapacity: undefined,
          },
        });
      }
    },
    [openDialog, calcCb],
  );

  const handleEdit = useCallback(
    (recipe: RecipeResponse) => {
      openDialog({
        title: DIALOG_TITLES.edit,
        dialogContentType: DIALOG_TYPES.edit as unknown as DialogContentType,
        data: recipe,
        onSuccess: handleRefresh,
      });
    },
    [openDialog, handleRefresh],
  );

  const handleDelete = useCallback(
    (recipe: RecipeResponse) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete as unknown as DialogContentType,
        data: recipe,
        onSuccess: handleRefresh,
      });
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
          <StatsCard
            label="Total Recipes"
            value={stats.totalRecipes}
            icon={<RestaurantMenuOutlined />}
            color="primary"
            variant="detailed"
          />
          <StatsCard
            label="Total Ingredients"
            value={stats.totalIngredients}
            icon={<KitchenOutlined />}
            color="success"
            variant="detailed"
          />
          <StatsCard
            label="Avg Ingredients"
            value={stats.averageIngredients}
            icon={<LocalDiningOutlined />}
            color="info"
            variant="detailed"
          />
          <StatsCard
            label="Total Recipe Cost"
            value={formatCurrency(stats.totalCost)}
            icon={<AttachMoney />}
            color="warning"
            variant="detailed"
          />
        </Flex>

        {(stats.mostExpensive.name || stats.mostIngredients.name) && (
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
