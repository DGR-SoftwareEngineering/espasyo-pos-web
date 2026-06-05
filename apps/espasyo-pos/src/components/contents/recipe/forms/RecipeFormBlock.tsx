import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { Box } from "@radix-ui/themes";
import { RecipeForm as RecipeFormType } from "./validation";
import { useApiCallback, useApi } from "core-lib/core/hooks";
import { RecipeForm } from "./RecipeForm";
import {
  RecipeGapWarning,
  InventoryGapCallout,
} from "core-lib/components/dialog/contents/recipe";
import {
  DetectGapDto,
  ProductDataList,
  RecipeParams,
  RecipeResponse,
  UnitDto,
  UntrackedSalesGapDto,
} from "core-lib/api/commons/types";

export const RecipeFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [ingredients, setIngredients] = useState<ProductDataList[]>([]);
  const [menuItems, setMenuItems] = useState<ProductDataList[]>([]);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const [showGapCallout, setShowGapCallout] = useState(false);
  const [gapData, setGapData] = useState<{
    menuItemName: string;
    gaps: UntrackedSalesGapDto[];
  } | null>(null);
  const [showEarlyWarning, setShowEarlyWarning] = useState(false);
  const [earlyDetectionGap, setEarlyDetectionGap] = useState<DetectGapDto | null>(null);
  const { showToast } = useToastContext();

  const recipeCb = useApiCallback(
    async (api, args: RecipeParams) => await api.commons.createRecipe(args),
  );

  const detectGapCb = useApiCallback(
    async (api, menuItemProductId: string) => await api.commons.detectGap(menuItemProductId),
  );

  const getMenuItems = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(true),
  );
  const getIngredients = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );
  const unitData = useApi((api) => api.commons.unitList());

  useEffect(() => {
    setIngredients(getIngredients.result?.data.response ?? []);
  }, [getIngredients.result?.data.response]);

  useEffect(() => {
    setMenuItems(getMenuItems.result?.data.response ?? []);
  }, [getMenuItems.result?.data.response]);

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

  const handleGapDismiss = () => {
    setShowGapCallout(false);
    setGapData(null);
    setResetForm(true);
    setTimeout(() => setResetForm(false), 100);
  };

  const handleMenuItemSelect = async (menuItemId: string) => {
    try {
      const result = await detectGapCb.execute(menuItemId);
      if (result.data.success) {
        const gaps = result.data.response?.gaps ?? [];
        if (gaps.length > 0) {
          setEarlyDetectionGap(gaps[0]);
          setShowEarlyWarning(true);
        } else {
          setShowEarlyWarning(false);
          setEarlyDetectionGap(null);
        }
      }
    } catch (error) {
      console.error("Error detecting gap:", error);
    }
  };

  const handleEarlyWarningProceed = () => {
    setShowEarlyWarning(false);
    setEarlyDetectionGap(null);
  };

  const handleEarlyWarningCancel = () => {
    setShowEarlyWarning(false);
    setEarlyDetectionGap(null);
    setResetForm(true);
    setTimeout(() => setResetForm(false), 100);
  };

  return (
    <Box>
      {showEarlyWarning && earlyDetectionGap && (
        <Box mb="4">
          <RecipeGapWarning
            gap={earlyDetectionGap}
            onProceed={handleEarlyWarningProceed}
            onCancel={handleEarlyWarningCancel}
            disabled={detectGapCb.loading}
          />
        </Box>
      )}
      {showGapCallout && gapData && (
        <InventoryGapCallout
          menuItemName={gapData.menuItemName}
          gaps={gapData.gaps}
          onDismiss={handleGapDismiss}
        />
      )}
      <RecipeForm
        onSubmit={handleSubmit}
        submitLoading={
          recipeCb.loading ||
          getMenuItems.loading ||
          getIngredients.loading ||
          unitData.loading ||
          loading
        }
        resetForm={resetForm}
        isEdit={false}
        isInDialog={false}
        ingredients={ingredients}
        menuItems={menuItems}
        units={units}
        onMenuItemSelect={handleMenuItemSelect}
      />
    </Box>
  );

  async function handleSubmit(data: RecipeFormType) {
    try {
      setLoading(true);

      const payload: RecipeParams = {
        menuItemProductID: data.menuItemProductID,
        notes: data.notes ?? null,
        recipeItems: (data.recipeItems ?? []).map((item) => ({
          ingredientProductID: item.ingredientProductID,
          quantityRequired: Number(item.quantityRequired),
          unitID: item.unitID,
          displayOrder: Number(item.displayOrder),
          notes: item.notes ?? null,
        })),
      };

      const result = await recipeCb.execute(payload);

      if (result.data.success) {
        showToast("Recipe created successfully", "success");

        // Check if there's a gap to report
        const recipeResp = result.data.response as RecipeResponse | undefined;
        if (recipeResp?.untrackedSalesGap && recipeResp.untrackedSalesGap.length > 0) {
          setGapData({
            menuItemName: recipeResp.menuItemName,
            gaps: recipeResp.untrackedSalesGap,
          });
          setShowGapCallout(true);
        } else {
          // No gap, reset form normally
          setResetForm(true);
          setTimeout(() => setResetForm(false), 100);
        }
        return;
      }

      showToast(extractErrorMessage(result.data), "error");
    } catch (error) {
      console.error("Error creating recipe:", error);
      const message =
        extractAxiosErrorMessage(error) || "Failed to create recipe";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }
};

function extractErrorMessage(data: {
  message?: string | null;
  errors?: unknown;
}): string {
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message?: unknown }).message);
    }
  }
  return data.message ?? "Failed to create recipe";
}

function extractAxiosErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (Array.isArray(error) && error.length > 0) {
    const first = error[0];
    if (typeof first === "string") return first;
  }
  const maybeAxios = error as {
    response?: { data?: { message?: string | null; errors?: unknown } };
  };
  if (maybeAxios.response?.data) {
    return extractErrorMessage(maybeAxios.response.data);
  }
  return null;
}
