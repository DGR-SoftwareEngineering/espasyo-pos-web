import React from "react";
import { Box } from "@radix-ui/themes";
import { useRecipeImportContext } from "./RecipeImportContext";
import { useRecipeImportSteps } from "./steps/useSteps";
import { ImportRecipeExcelDto } from "core-lib/api/commons/types";

export const RecipeImportForm: React.FC = () => {
  const { previewData, selectedRecipes, executeImport } = useRecipeImportContext();

  const handleImport = async ({ password, mpin }: { password: string; mpin: string }) => {
    if (!previewData) return;

    const recipesToImport = previewData.recipes
      .filter((r) => selectedRecipes.has(r.menuItemName))
      .map((r) => ({
        menuItemName: r.menuItemName,
        sellingPrice: r.sellingPrice,
        categoryID: r.categoryID ?? "",
        recipeItems: r.items.map((item) => ({
          ingredientName: item.ingredientName,
          quantityRequired: item.quantityRequired,
          unitName: item.unitName,
          ingredientCategoryID: item.ingredientCategoryID ?? null,
          packagePrice: item.packagePrice ?? 0,
          qtyPerPack: item.qtyPerPack ?? 1,
          ingredientExistsInDb: item.ingredientExistsInDb,
        })),
      }));

    const dto: ImportRecipeExcelDto = {
      password,
      mpin,
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
