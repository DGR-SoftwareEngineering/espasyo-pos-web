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
  Tooltip,
  LinearProgress,
  CardContent,
  IconButton,
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
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  CancelOutlined,
  AttachMoney,
  ProductionQuantityLimitsOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useToastContext } from "../../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../../core/hooks";
import {
  RecipeResponse,
  RecipeItemResponse,
  ProductDataList,
  CategoryDataList,
  UpdateRecipeParams,
  ProductionCapacity,
} from "../../../../../api/commons/types";
import { RecipeForm as RecipeFormType } from "../../validation";
import { RecipeForm } from "../../RecipeForm";
import { formatCurrency } from "../../../../../business/strings";
import { Card } from "../../../../Card";

interface Props {
  recipe: RecipeResponse;
  productionCapacity?: ProductionCapacity;
}

export const RecipeViewDialog: React.FC<Props> = ({
  recipe,
  productionCapacity,
}) => {
  const theme = useTheme();

  const calculateTotalCost = (): number => {
    if (!recipe?.recipeItems) return 0;
    return recipe.recipeItems.reduce((sum, item) => sum + (item?.cost || 0), 0);
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "₱0.00";
    }
    return `₱${amount.toFixed(2)}`;
  };

  const totalCost = calculateTotalCost();
  const ingredientCount = recipe?.recipeItems?.length || 0;

  const getStatusColor = (status: string | undefined) => {
    if (!status) return theme.palette.text.secondary;
    switch (status) {
      case "InStock":
        return theme.palette.success.main;
      case "LowStock":
        return theme.palette.warning.main;
      case "OutOfStock":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <></>;
    switch (status) {
      case "InStock":
        return <CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />;
      case "LowStock":
        return <WarningAmberOutlined sx={{ fontSize: 16 }} />;
      case "OutOfStock":
        return <CancelOutlined sx={{ fontSize: 16 }} />;
      default:
        return <></>;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "Unknown";
    switch (status) {
      case "InStock":
        return "In Stock";
      case "LowStock":
        return "Low Stock";
      case "OutOfStock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  // Calculate stock percentage for progress bar
  const getStockPercentage = (available: number, required: number) => {
    if (!available || !required || required === 0) return 0;
    const percentage = (available / required) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <Box sx={{ p: 0, maxHeight: "80vh", overflow: "auto" }}>
      {/* Header with Close Button */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <RestaurantMenuOutlined sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {recipe?.menuItemName || "Unknown Recipe"}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                label={`Recipe ID: ${recipe?.recipeID?.substring(0, 8) || "N/A"}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  height: 24,
                }}
              />
              <Chip
                label={`Menu ID: ${recipe?.menuItemProductID?.substring(0, 8) || "N/A"}...`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  height: 24,
                }}
              />
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={() => {}} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* Section: Recipe Overview */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <InfoOutlined
                sx={{ color: theme.palette.primary.main, fontSize: 20 }}
              />
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.secondary"
              >
                Recipe Overview
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.04),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Recipe Cost
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="success.main"
                    >
                      {formatCurrency(totalCost)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.04),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="caption" color="text.secondary">
                      Ingredients
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="info.main">
                      {ingredientCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.04),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="caption" color="text.secondary">
                      Avg Cost/Ingredient
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="warning.main"
                    >
                      {formatCurrency(
                        ingredientCount > 0 ? totalCost / ingredientCount : 0,
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Section: Production Capacity */}
          {productionCapacity && (
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <ProductionQuantityLimitsOutlined
                  sx={{
                    color: getStatusColor(productionCapacity.overallStatus),
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Production Capacity
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(
                    getStatusColor(productionCapacity.overallStatus),
                    0.03,
                  ),
                  borderRadius: 2,
                  border: `1px solid ${alpha(getStatusColor(productionCapacity.overallStatus), 0.15)}`,
                }}
              >
                <CardContent>
                  <Stack spacing={3}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Chip
                        icon={getStatusIcon(productionCapacity.overallStatus)}
                        label={getStatusLabel(productionCapacity.overallStatus)}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            getStatusColor(productionCapacity.overallStatus),
                            0.1,
                          ),
                          color: getStatusColor(
                            productionCapacity.overallStatus,
                          ),
                        }}
                      />
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Maximum Units
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {productionCapacity.maxUnitsCanProduce ?? 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            units can be produced
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cost Per Unit
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="success.main"
                          >
                            {formatCurrency(
                              productionCapacity.totalCostPerUnit,
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            per serving
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total Cost at Max
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="warning.main"
                          >
                            {formatCurrency(
                              productionCapacity.totalCostMaxProduction,
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            for max production
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {productionCapacity.maxUnitsCanProduce === 0 && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="error.main"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <WarningAmberOutlined sx={{ fontSize: 20 }} />
                          Cannot produce {recipe?.menuItemName} due to
                          insufficient ingredients
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Section: Inventory Constraints */}
          {productionCapacity?.constraints &&
            productionCapacity.constraints.length > 0 && (
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <KitchenOutlined sx={{ color: theme.palette.warning.main }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Inventory Constraints
                  </Typography>
                  {productionCapacity.bottleneckIngredients &&
                    productionCapacity.bottleneckIngredients.length > 0 && (
                      <Chip
                        label={`${productionCapacity.bottleneckIngredients.length} Bottleneck${productionCapacity.bottleneckIngredients.length !== 1 ? "s" : ""}`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                        }}
                      />
                    )}
                </Stack>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>
                  {productionCapacity.constraints.map((constraint, index) => {
                    const stockPercentage = getStockPercentage(
                      constraint.availableQuantity,
                      constraint.requiredPerUnit,
                    );
                    const statusColor = getStatusColor(constraint.status);

                    return (
                      <Card
                        key={index}
                        elevation={0}
                        sx={{
                          bgcolor: alpha(statusColor, 0.02),
                          border: `1px solid ${alpha(statusColor, 0.15)}`,
                          borderRadius: 2,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(statusColor, 0.04),
                            borderColor: alpha(statusColor, 0.3),
                          },
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 3 }}>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: alpha(statusColor, 0.1),
                                    color: statusColor,
                                  }}
                                >
                                  <InventoryOutlined />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                  >
                                    {constraint.ingredientName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Required: {constraint.requiredPerUnit}{" "}
                                    {constraint.unitName}/unit
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>

                            <Grid size={{ xs: 6, sm: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Available
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {constraint.availableQuantity}{" "}
                                {constraint.unitName}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 6, sm: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Max Units
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color={statusColor}
                              >
                                {constraint.maxUnitsFromThisIngredient}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                              <Box sx={{ width: "100%" }}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  sx={{ mb: 0.5 }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Stock Level
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color={statusColor}
                                  >
                                    {stockPercentage.toFixed(0)}%
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(stockPercentage, 100)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: alpha(statusColor, 0.1),
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 3,
                                      bgcolor: statusColor,
                                    },
                                  }}
                                />
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 2 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >
                                {constraint.isBottleneck && (
                                  <Tooltip
                                    title="This ingredient is limiting production"
                                    arrow
                                  >
                                    <Chip
                                      label="Bottleneck"
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(
                                          theme.palette.error.main,
                                          0.1,
                                        ),
                                        color: theme.palette.error.main,
                                        height: 24,
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                <Chip
                                  icon={getStatusIcon(constraint.status)}
                                  label={getStatusLabel(constraint.status)}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(statusColor, 0.1),
                                    color: statusColor,
                                    height: 24,
                                  }}
                                />
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}

          {/* Section: Ingredients List */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <InventoryOutlined sx={{ color: theme.palette.primary.main }} />
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.secondary"
              >
                Ingredients
              </Typography>
              <Chip
                label={`${ingredientCount} item${ingredientCount !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              {recipe?.recipeItems?.map((item, idx) => {
                const constraint = productionCapacity?.constraints?.find(
                  (c) => c.ingredientName === item.ingredientName,
                );
                const statusColor = constraint
                  ? getStatusColor(constraint.status)
                  : null;

                return (
                  <Card
                    key={item.recipeItemID}
                    elevation={0}
                    sx={{
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                              }}
                            >
                              <InventoryOutlined />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {item.ingredientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "monospace" }}
                              >
                                ID:{" "}
                                {item.ingredientProductID?.substring(0, 8) ||
                                  "N/A"}
                                ...
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Quantity
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <ScaleOutlined
                              sx={{
                                fontSize: 14,
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {item.quantityRequired} {item.unitName}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Cost
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.main"
                          >
                            {formatCurrency(item.cost)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Unit Cost
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(item.ingredientCost)}/
                            {item.unitName}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          {constraint && (
                            <Chip
                              icon={getStatusIcon(constraint.status)}
                              label={getStatusLabel(constraint.status)}
                              size="small"
                              sx={{
                                bgcolor: alpha(statusColor!, 0.1),
                                color: statusColor,
                                height: 24,
                              }}
                            />
                          )}
                          {item.notes && !constraint && (
                            <Tooltip title={item.notes} arrow>
                              <Chip
                                icon={<NotesOutlined />}
                                label="Notes"
                                size="small"
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.warning.main,
                                    0.1,
                                  ),
                                  color: theme.palette.warning.main,
                                  cursor: "help",
                                  height: 24,
                                }}
                              />
                            </Tooltip>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Box>
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
