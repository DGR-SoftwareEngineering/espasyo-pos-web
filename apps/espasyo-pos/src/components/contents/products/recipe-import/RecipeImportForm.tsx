import React from "react";
import { Box } from "@radix-ui/themes";
import { useRecipeImportContext } from "./RecipeImportContext";
import { useRecipeImportSteps } from "./steps/useSteps";
import { ImportRecipeExcelDto } from "core-lib/api/commons/types";

export const RecipeImportForm: React.FC = () => {
  const {
    previewData,
    selectedFile,
    ingredientCategoryId,
    menuItemCategoryId,
    selectedIngredients,
    selectedRecipes,
    executeImport,
  } = useRecipeImportContext();

  const handleImport = async () => {
    if (!previewData || !selectedFile) return;

    const ingredientsToImport = previewData.ingredients.filter((i) =>
      selectedIngredients.has(i.name)
    );
    const recipesToImport = previewData.recipes
      .filter((r) => selectedRecipes.has(r.menuItemName))
      .map((r) => ({
        menuItemName: r.menuItemName,
        sellingPrice: r.sellingPrice,
        recipeItems: r.items.map((item) => ({
          ingredientName: item.ingredientName,
          quantityRequired: item.quantityRequired,
          unitName: item.unitName,
        })),
      }));

    const dto: ImportRecipeExcelDto = {
      defaultIngredientCategoryID: ingredientCategoryId,
      defaultMenuItemCategoryID: menuItemCategoryId,
      ingredients: ingredientsToImport.map((i) => ({
        name: i.name,
        packagePrice: i.packagePrice,
        qtyPerPack: i.qtyPerPack,
        unitName: i.unitName,
      })),
      recipes: recipesToImport,
    };

    await executeImport(dto);
  };

  const { render } = useRecipeImportSteps(handleImport);

  return (
    <Box style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem" }}>
      {render}
    </Box>
  );
};
