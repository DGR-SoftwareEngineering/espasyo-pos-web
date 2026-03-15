import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { RecipeForm as RecipeFormType } from "./validation";
import { useApiCallback, useApi } from "../../../core/hooks";
import { RecipeForm } from "./RecipeForm";
import { CategoryDataList, ProductDataList } from "../../../api/commons/types";

export const RecipeFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [ingredients, setIngredients] = useState<ProductDataList[]>([]);
  const [menuItems, setMenuItems] = useState<ProductDataList[]>([]);
  const [categories, setCategories] = useState<CategoryDataList[]>([]);
  const { showToast } = useToastContext();

  const recipeCb = useApiCallback(
    async (api, args: RecipeFormType) => await api.commons.createRecipe(args),
  );

  const getMenuItems = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(true),
  );
  const getIngredients = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );
  const data = useApi((api) => api.commons.categoryList());

  useEffect(() => {
    setIngredients(getIngredients.result?.data.response ?? []);
  }, [getIngredients.result?.data.response]);

  useEffect(() => {
    setMenuItems(getMenuItems.result?.data.response ?? []);
  }, [getMenuItems.result?.data.response]);

  useEffect(() => {
    setCategories(data.result?.data.response ?? []);
  }, [data.result?.data.response]);

  return (
    <RecipeForm
      onSubmit={handleSubmit}
      submitLoading={
        recipeCb.loading ||
        getMenuItems.loading ||
        getIngredients.loading ||
        data.loading ||
        loading
      }
      resetForm={resetForm}
      isEdit={false}
      isInDialog={false}
      ingredients={ingredients}
      menuItems={menuItems}
      units={categories}
    />
  );

  async function handleSubmit(data: RecipeFormType) {
    try {
      setLoading(true);
      const result = await recipeCb.execute(data);

      if (result.status === 200 && result.data.success) {
        showToast("Recipe created successfully", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      } else {
        showToast(result.data.message || "Failed to create recipe", "error");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      showToast("Failed to create recipe", "error");
    } finally {
      setLoading(false);
    }
  }
};
