import { useEffect, useState } from "react";
import {
  ProductDataList,
  RecipeResponse,
  UnitDto,
  UpdateRecipeParams,
} from "../../../../api/commons/types";
import { useToastContext } from "../../../../core/contexts";
import { useApi, useApiCallback } from "../../../../core/hooks";
import { Box, Typography } from "@mui/material";
import { FormRenderer } from "../../../radix/form/FormRenderer";

export const RecipeEditDialogContent: React.FC<{
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
  const unitData = useApi((api) => api.commons.unitList());
  const updateRecipeCb = useApiCallback(
    async (api, args: UpdateRecipeParams) =>
      await api.commons.updateRecipe(args),
  );

  const [menuItems, setMenuItems] = useState<ProductDataList[]>([]);
  const [ingredients, setIngredients] = useState<ProductDataList[]>([]);
  const [units, setUnits] = useState<UnitDto[]>([]);

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
    if (unitData.result?.data.response) {
      setUnits(unitData.result.data.response);
    }
  }, [unitData.result?.data.response]);

  const initialValues = {
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
    getMenuItems.loading || getIngredients.loading || unitData.loading;

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading recipe data...</Typography>
        </Box>
      ) : (
        <FormRenderer
          formKey="recipe-form"
          onSubmit={handleSubmit}
          submitLoading={updateRecipeCb.loading}
          menuItems={menuItems}
          ingredients={ingredients}
          units={units}
          initialValues={initialValues}
          isInDialog={true}
          isEdit={true}
        />
      )}
    </Box>
  );

  async function handleSubmit(formValues: UpdateRecipeParams) {
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

          if (wasExisting && item?.recipeItemId) {
            recipeItem.recipeItemId = item.recipeItemId;
          } else if (wasExisting && !item.recipeItemId) {
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
