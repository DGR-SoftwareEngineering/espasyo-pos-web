import React, { createContext, useContext, useState, useMemo } from "react";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import {
  RecipeImportPreviewDto,
  RecipeImportResultDto,
  RecipeImportStagingResultDto,
  ImportRecipeExcelDto,
  IngredientCategoryDto,
  ProductCategoryDto,
  RecipeImportPreviewResponse,
  RecipeImportResultResponse,
  IngredientPreviewItemDto,
  RecipeItemPreviewDto,
} from "core-lib/api/commons/types";
import { AxiosResponse } from "axios";

type Step = "upload" | "preview" | "result";

interface RecipeImportContextValue {
  // State
  currentStep: Step;
  selectedFile: File | null;
  ingredientCategoryId: string;
  menuItemCategoryId: string;
  previewData: RecipeImportPreviewDto | null;
  selectedIngredients: Set<string>;
  selectedRecipes: Set<string>;
  resultData: RecipeImportStagingResultDto | null;

  // Lookups
  ingredientCategories: IngredientCategoryDto[];
  menuItemCategories: ProductCategoryDto[];
  previewLoading: boolean;
  importLoading: boolean;

  // Actions
  setCurrentStep: (step: Step) => void;
  setSelectedFile: (file: File | null) => void;
  setIngredientCategoryId: (id: string) => void;
  setMenuItemCategoryId: (id: string) => void;
  toggleIngredient: (name: string) => void;
  toggleRecipe: (name: string) => void;
  updateIngredient: (originalName: string, patch: Partial<IngredientPreviewItemDto>) => void;
  updateRecipeMenuItemName: (originalName: string, newName: string) => void;
  updateRecipeItem: (menuItemName: string, itemIndex: number, patch: Partial<RecipeItemPreviewDto>) => void;
  executePreview: (file: File) => Promise<void>;
  executeImport: (dto: ImportRecipeExcelDto) => Promise<void>;
  reset: () => void;
}

const RecipeImportContext = createContext<RecipeImportContextValue | undefined>(
  undefined
);

export const useRecipeImportContext = (): RecipeImportContextValue => {
  const context = useContext(RecipeImportContext);
  if (!context) {
    throw new Error(
      "useRecipeImportContext must be used within RecipeImportProvider"
    );
  }
  return context;
};

interface RecipeImportProviderProps {
  children: React.ReactNode;
  onImportComplete?: () => void;
}

export const RecipeImportProvider: React.FC<RecipeImportProviderProps> = ({
  children,
  onImportComplete,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ingredientCategoryId, setIngredientCategoryId] = useState<string>("");
  const [menuItemCategoryId, setMenuItemCategoryId] = useState<string>("");
  const [previewData, setPreviewData] =
    useState<RecipeImportPreviewDto | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(
    new Set()
  );
  const [resultData, setResultData] =
    useState<RecipeImportStagingResultDto | null>(null);

  // Fetch categories
  const { result: ingredientCatsResult } = useApi(
    (api) => api.commons.ingredientCategoryList(),
    []
  );
  const { result: menuItemCatsResult } = useApi(
    (api) => api.commons.productCategoryList(),
    []
  );

  const ingredientCategories = ingredientCatsResult?.data?.response || [];
  const menuItemCategories = menuItemCatsResult?.data?.response || [];

  // API callbacks
  const previewCb = useApiCallback(
    async (api, file: File) => api.commons.previewRecipeImport({ file })
  );

  const importCb = useApiCallback(
    async (api, dto: ImportRecipeExcelDto) => api.commons.importRecipeExcel(dto)
  );

  // Toggle functions
  const toggleIngredient = (name: string) => {
    const newSet = new Set(selectedIngredients);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedIngredients(newSet);
  };

  const toggleRecipe = (name: string) => {
    const newSet = new Set(selectedRecipes);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedRecipes(newSet);
  };

  const updateIngredient = (originalName: string, patch: Partial<IngredientPreviewItemDto>) => {
    setPreviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map(i => i.name === originalName ? { ...i, ...patch } : i),
      };
    });
    if (patch.name && patch.name !== originalName) {
      setSelectedIngredients(prev => {
        const next = new Set(prev);
        if (next.has(originalName)) { next.delete(originalName); next.add(patch.name!); }
        return next;
      });
    }
  };

  const updateRecipeMenuItemName = (originalName: string, newName: string) => {
    setPreviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        recipes: prev.recipes.map(r => r.menuItemName === originalName ? { ...r, menuItemName: newName } : r),
      };
    });
    setSelectedRecipes(prev => {
      const next = new Set(prev);
      if (next.has(originalName)) { next.delete(originalName); next.add(newName); }
      return next;
    });
  };

  const updateRecipeItem = (menuItemName: string, itemIndex: number, patch: Partial<RecipeItemPreviewDto>) => {
    setPreviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        recipes: prev.recipes.map(r => {
          if (r.menuItemName !== menuItemName) return r;
          const items = [...r.items];
          items[itemIndex] = { ...items[itemIndex], ...patch };
          return { ...r, items };
        }),
      };
    });
  };

  // Actions
  const executePreview = async (file: File) => {
    const response = await previewCb.execute(file);
    if (response?.data?.response) {
      const preview = response.data.response;
      setPreviewData(preview);

      // Select all by default
      const ingNames = preview.ingredients.map((i) => i.name);
      const recNames = preview.recipes.map((r) => r.menuItemName);
      setSelectedIngredients(new Set(ingNames));
      setSelectedRecipes(new Set(recNames));

      setCurrentStep("preview");
    }
  };

  const executeImport = async (dto: ImportRecipeExcelDto) => {
    const response = await importCb.execute(dto);
    if (response?.data?.response) {
      setResultData(response.data.response);
      onImportComplete?.();
      setCurrentStep("result");
    }
  };

  const reset = () => {
    setCurrentStep("upload");
    setSelectedFile(null);
    setIngredientCategoryId("");
    setMenuItemCategoryId("");
    setPreviewData(null);
    setSelectedIngredients(new Set());
    setSelectedRecipes(new Set());
    setResultData(null);
  };

  const value: RecipeImportContextValue = useMemo(
    () => ({
      currentStep,
      selectedFile,
      ingredientCategoryId,
      menuItemCategoryId,
      previewData,
      selectedIngredients,
      selectedRecipes,
      resultData,
      ingredientCategories,
      menuItemCategories,
      previewLoading: previewCb.loading,
      importLoading: importCb.loading,
      setCurrentStep,
      setSelectedFile,
      setIngredientCategoryId,
      setMenuItemCategoryId,
      toggleIngredient,
      toggleRecipe,
      updateIngredient,
      updateRecipeMenuItemName,
      updateRecipeItem,
      executePreview,
      executeImport,
      reset,
    }),
    [
      currentStep,
      selectedFile,
      ingredientCategoryId,
      menuItemCategoryId,
      previewData,
      selectedIngredients,
      selectedRecipes,
      resultData,
      ingredientCategories,
      menuItemCategories,
      previewCb.loading,
      importCb.loading,
    ]
  );

  return (
    <RecipeImportContext.Provider value={value}>
      {children}
    </RecipeImportContext.Provider>
  );
};
