import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Grid,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  LocalDiningOutlined,
  ScaleOutlined,
  NotesOutlined,
  InventoryOutlined,
  Close,
  Delete,
  Edit,
  Save,
} from "@mui/icons-material";
import { useToastContext } from "../../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../../core/hooks";
import {
  RecipeResponse,
  RecipeItemResponse,
  ProductDataList,
  CategoryDataList,
  UpdateRecipeParams,
} from "../../../../../api/commons/types";
import { RecipeForm as RecipeFormType } from "../../validation";
import { RecipeForm } from "../../RecipeForm";
import { formatCurrency } from "../../../../../business/strings";

export const RecipeViewDialog: React.FC<{ recipe: RecipeResponse }> = ({
  recipe,
}) => {
  const theme = useTheme();

  const calculateTotalCost = (): number => {
    return recipe.recipeItems.reduce((sum, item) => sum + item.cost, 0);
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toFixed(2)}`;
  };

  const totalCost = calculateTotalCost();
  const ingredientCount = recipe.recipeItems.length;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <RestaurantMenuOutlined sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {recipe.menuItemName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={`Recipe ID: ${recipe.recipeID.substring(0, 8)}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
              <Chip
                label={`Menu ID: ${recipe.menuItemProductID.substring(0, 8)}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Summary Stats */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.04),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Total Cost
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight={700}>
                {formatCurrency(totalCost)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.04),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Ingredients
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight={700}>
                {ingredientCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.04),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Avg Cost/Ingredient
              </Typography>
              <Typography variant="h5" color="warning.main" fontWeight={700}>
                {formatCurrency(totalCost / ingredientCount)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Ingredients List */}
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Ingredients
          </Typography>
          <Stack spacing={2}>
            {recipe.recipeItems
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((item) => (
                <Paper
                  key={item.recipeItemID}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                          }}
                        >
                          <InventoryOutlined sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.ingredientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.ingredientProductID.substring(0, 6)}...
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ScaleOutlined
                          sx={{
                            fontSize: 16,
                            color: theme.palette.text.secondary,
                          }}
                        />
                        <Typography variant="body2">
                          {item.quantityRequired} {item.unitName}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
                        {formatCurrency(item.cost)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(item.ingredientCost)}/{item.unitName}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      {item.notes ? (
                        <Chip
                          icon={<NotesOutlined />}
                          label="Notes"
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                          }}
                        />
                      ) : null}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export const RecipeEditDialog: React.FC<{
  recipe: RecipeResponse;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ recipe, onSuccess, onClose }) => {
  const { showToast } = useToastContext();

  const getMenuItems = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(true),
  );
  const getIngredients = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );
  const categoriesData = useApi((api) => api.commons.categoryList());
  const updateRecipeCb = useApiCallback(
    async (api, args: UpdateRecipeParams) =>
      await api.commons.updateRecipe(args),
  );

  const [menuItems, setMenuItems] = useState<ProductDataList[]>([]);
  const [ingredients, setIngredients] = useState<ProductDataList[]>([]);
  const [categories, setCategories] = useState<CategoryDataList[]>([]);

  useEffect(() => {
    if (getMenuItems.result?.data.response) {
      setMenuItems(getMenuItems.result.data.response);
    }
  }, [getMenuItems.result?.data.response]);

  useEffect(() => {
    if (getIngredients.result?.data.response) {
      setIngredients(getIngredients.result.data.response);
    }
  }, [getIngredients.result?.data.response]);

  useEffect(() => {
    if (categoriesData.result?.data.response) {
      setCategories(categoriesData.result.data.response);
    }
  }, [categoriesData.result?.data.response]);

  const initialValues: Partial<RecipeFormType> = {
    menuItemProductID: recipe.menuItemProductID,
    recipeItems: recipe.recipeItems.map((item) => ({
      recipeItemID: item.recipeItemID,
      ingredientProductID: item.ingredientProductID,
      quantityRequired: item.quantityRequired,
      unitID: item.unitID,
      displayOrder: item.displayOrder,
      notes: item.notes || "",
    })),
  };

  const loading =
    getMenuItems.loading || getIngredients.loading || categoriesData.loading;

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading recipe data...</Typography>
        </Box>
      ) : (
        <RecipeForm
          onSubmit={handleSubmit}
          submitLoading={updateRecipeCb.loading}
          initialValues={initialValues}
          menuItems={menuItems}
          ingredients={ingredients}
          units={categories}
          isInDialog
          isEdit
        />
      )}
    </Box>
  );

  async function handleSubmit(formValues: RecipeFormType) {
    try {
      const existingIngredientIds = recipe.recipeItems.map(
        (item) => item.ingredientProductID,
      );

      const updateData: UpdateRecipeParams = {
        recipeId: recipe.recipeID,
        recipeItems: formValues.recipeItems.map((item) => {
          const wasExisting = existingIngredientIds.includes(
            item.ingredientProductID,
          );

          const recipeItem: {
            recipeItemId?: string;
            ingredientProductID: string;
            quantityRequired: number;
            unitID: string;
            displayOrder: number;
            notes: string;
          } = {
            ingredientProductID: item.ingredientProductID,
            quantityRequired: Number(item.quantityRequired),
            unitID: item.unitID,
            displayOrder: item.displayOrder,
            notes: item.notes || "",
          };

          if (wasExisting && item.recipeItemID) {
            recipeItem.recipeItemId = item.recipeItemID;
          } else if (wasExisting && !item.recipeItemID) {
            const originalItem = recipe.recipeItems.find(
              (ri) => ri.ingredientProductID === item.ingredientProductID,
            );
            if (originalItem) {
              recipeItem.recipeItemId = originalItem.recipeItemID;
            }
          }

          return recipeItem;
        }),
      };

      const result = await updateRecipeCb.execute(updateData);

      if (result.data.success) {
        showToast("Recipe updated successfully", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.data.message || "Failed to update recipe", "error");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      showToast("Failed to update recipe", "error");
    }
  }
};

export const RecipeDeleteDialog: React.FC<{
  recipe: RecipeResponse;
  onSuccess: () => void;
  onClose: () => void;
}> = ({ recipe, onSuccess, onClose }) => {
  const theme = useTheme();
  const { showToast } = useToastContext();

  const softDeleteRecipeCb = useApiCallback(
    async (api, recipeId: string) =>
      await api.commons.softDeleteRecipe(recipeId),
  );

  const totalCost = recipe.recipeItems.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Delete Recipe
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, color: theme.palette.text.secondary }}
      >
        Are you sure you want to delete this recipe? This action cannot be
        undone.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: alpha(theme.palette.error.main, 0.02),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
            }}
          >
            <RestaurantMenuOutlined />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {recipe.menuItemName}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1 }}
              flexWrap="wrap"
              gap={1}
            >
              <Chip
                label={`Recipe ID: ${recipe.recipeID.substring(0, 8)}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                }}
              />
              <Chip
                label={`${recipe.recipeItems.length} ingredient${recipe.recipeItems.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                }}
              />
              <Chip
                label={formatCurrency(totalCost)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Warning about ingredient associations */}
      {recipe.recipeItems.length > 0 && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <KitchenOutlined
              sx={{ fontSize: 18, color: theme.palette.warning.main }}
            />
            <span>
              <strong>Note:</strong> This recipe contains{" "}
              {recipe.recipeItems.length} ingredient
              {recipe.recipeItems.length !== 1 ? "s" : ""}. Deleting it will
              remove all ingredient associations.
            </span>
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Close />}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={softDeleteRecipeCb.loading}
          startIcon={<Delete />}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          {softDeleteRecipeCb.loading ? "Deleting..." : "Delete Recipe"}
        </Button>
      </Stack>
    </Box>
  );

  async function handleDelete() {
    try {
      const result = await softDeleteRecipeCb.execute(recipe.recipeID);

      if (result.data.success) {
        showToast("Recipe deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.data.message || "Failed to delete recipe", "error");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      showToast("Failed to delete recipe", "error");
    }
  }
};
