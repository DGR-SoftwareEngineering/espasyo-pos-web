import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
  Fade,
  Chip,
  Button,
  Tooltip,
} from "@mui/material";
import {
  RefreshOutlined,
  RestaurantMenuOutlined,
  AttachMoney,
  KitchenOutlined,
  LocalDiningOutlined,
  TrendingUp,
  Whatshot,
} from "@mui/icons-material";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import {
  useDialogContext,
  HeaderV2,
  StatsCard,
  FilterBar,
  registerForm,
} from "core-lib";
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

export const RecipeListBlock: React.FC = () => {
  const theme = useTheme();
  const { openDialog } = useDialogContext();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  registerForm("recipe-form", RecipeForm);

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
          recipe.recipeID.toLowerCase().includes(query) ||
          recipe.recipeItems.some((item) =>
            item.ingredientName.toLowerCase().includes(query),
          ),
      );
    }

    const appliedFiltered = applyRecipeSorting(filtered, filters);
    return appliedFiltered;
  }, [recipes, filters]);

  const paginatedData = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return filteredRecipes.slice(start, end);
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
            dialogContentType: DIALOG_TYPES.view,
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
          dialogContentType: DIALOG_TYPES.view,
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
        dialogContentType: DIALOG_TYPES.edit,
        data: recipe,
        onSuccess: handleRefresh,
      });
    },
    [openDialog],
  );

  const handleDelete = useCallback(
    (recipe: RecipeResponse) => {
      openDialog({
        title: DIALOG_TITLES.delete,
        dialogContentType: DIALOG_TYPES.delete,
        data: recipe,
        onSuccess: handleRefresh,
      });
    },
    [openDialog],
  );

  const handleNextPage = useCallback(() => {
    if (clientPagination.hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  }, [clientPagination.hasNextPage]);

  const handlePreviousPage = useCallback(() => {
    if (clientPagination.hasPreviousPage) {
      setPageNumber((prev) => prev - 1);
    }
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
    <Fade in timeout={500}>
      <Box sx={{ width: "100%", p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.03,
            )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <HeaderV2
            title="Recipe Management"
            subtitle="Create and manage your recipe catalog with ingredient compositions"
            icon={<RestaurantMenuOutlined sx={{ fontSize: 28 }} />}
            actionButton={{
              label: "New Recipe",
              onClick: () => {},
              variant: "contained",
              color: "primary",
            }}
          />

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4, flexWrap: "wrap", gap: 2 }}
          >
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
          </Stack>

          {(stats.mostExpensive.name || stats.mostIngredients.name) && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              {stats.mostExpensive.name && (
                <Chip
                  icon={<TrendingUp />}
                  label={`Most Expensive: ${stats.mostExpensive.name}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                />
              )}
              {stats.mostIngredients.name && (
                <Chip
                  icon={<Whatshot />}
                  label={`Most Ingredients: ${stats.mostIngredients.name}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                />
              )}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <FilterBar
              searchValue={filters.searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search recipes by name, ID, or ingredients..."
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
              showFilterChip={true}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
              disabled={data.loading}
              sx={{ borderRadius: 3, ml: 2, px: 3, py: 1 }}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
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
        </Paper>

        {filteredRecipes.length > 0 && (
          <Fade in timeout={800}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing{" "}
                {filteredRecipes.length === 0
                  ? 0
                  : (pageNumber - 1) * pageSize + 1}{" "}
                to {Math.min(pageNumber * pageSize, filteredRecipes.length)} of{" "}
                <strong>{filteredRecipes.length}</strong> recipes
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Page <strong>{pageNumber}</strong> of{" "}
                  <strong>{clientPagination.totalPages}</strong>
                </Typography>
                {serverPagination &&
                  serverPagination.totalPages > 0 &&
                  serverPagination.totalItems !== filteredRecipes.length && (
                    <Tooltip
                      title="Server-side pagination info (total items across all pages)"
                      arrow
                    >
                      <Chip
                        label={`Total in database: ${serverPagination.totalItems} recipes`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.625rem",
                          bgcolor: alpha(theme.palette.info.main, 0.08),
                          color: theme.palette.info.main,
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  )}
              </Stack>
            </Box>
          </Fade>
        )}
      </Box>
    </Fade>
  );
};
