import React, { createContext, useContext, useState, useMemo } from "react";
import { useApiCallback } from "core-lib/core/hooks";
import {
  RecipeImportPreviewDto,
  RecipeImportStagingResultDto,
  ImportRecipeExcelDto,
  RecipePreviewItemDto,
} from "core-lib/api/commons/types";

export type Step = "info" | "upload" | "config" | "preview" | "result";

interface RecipeImportContextValue {
  currentStep: Step;
  selectedFile: File | null;
  previewData: RecipeImportPreviewDto | null;
  selectedRecipes: Set<string>;
  resultData: RecipeImportStagingResultDto | null;
  recipeLimit: number | "all";

  previewLoading: boolean;
  importLoading: boolean;

  setCurrentStep: (step: Step) => void;
  setSelectedFile: (file: File | null) => void;
  setRecipeLimit: (v: number | "all") => void;
  applyLimitsAndPreview: (limit: number | "all", skipExistingFull?: boolean) => void;
  toggleRecipe: (name: string) => void;
  updateRecipe: (menuItemName: string, patch: Partial<RecipePreviewItemDto>) => void;
  executePreview: (file: File) => Promise<string | null>;
  executeImport: (dto: ImportRecipeExcelDto) => Promise<void>;
  reset: () => void;
}

const RecipeImportContext = createContext<RecipeImportContextValue | undefined>(
  undefined
);

export const useRecipeImportContext = (): RecipeImportContextValue => {
  const context = useContext(RecipeImportContext);
  if (!context) {
    throw new Error("useRecipeImportContext must be used within RecipeImportProvider");
  }
  return context;
};

interface RecipeImportProviderProps {
  children: React.ReactNode;
  onImportComplete?: () => void;
  onGoToHistory?: () => void;
}

export const RecipeImportProvider: React.FC<RecipeImportProviderProps> = ({
  children,
  onImportComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<RecipeImportPreviewDto | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [resultData, setResultData] = useState<RecipeImportStagingResultDto | null>(null);
  const [recipeLimit, setRecipeLimit] = useState<number | "all">("all");

  const previewCb = useApiCallback(
    async (api, file: File) => api.commons.previewRecipeImport({ file })
  );

  const importCb = useApiCallback(
    async (api, dto: ImportRecipeExcelDto) => api.commons.importRecipeExcel(dto)
  );

  const toggleRecipe = (name: string) => {
    const newSet = new Set(selectedRecipes);
    if (newSet.has(name)) newSet.delete(name); else newSet.add(name);
    setSelectedRecipes(newSet);
  };

  const updateRecipe = (menuItemName: string, patch: Partial<RecipePreviewItemDto>) => {
    setPreviewData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        recipes: prev.recipes.map(r =>
          r.menuItemName === menuItemName ? { ...r, ...patch } : r
        ),
      };
    });
    if (patch.menuItemName && patch.menuItemName !== menuItemName) {
      setSelectedRecipes(prev => {
        const next = new Set(prev);
        if (next.has(menuItemName)) {
          next.delete(menuItemName);
          next.add(patch.menuItemName!);
        }
        return next;
      });
    }
  };

  const applyLimitsAndPreview = (limit: number | "all", skipExistingFull = false) => {
    if (!previewData) return;
    let recipes = previewData.recipes;
    if (skipExistingFull) {
      recipes = recipes.filter(r => !(r.menuItemAlreadyExistsInDb && r.hasExistingActiveRecipe));
    }
    const allRecNames = recipes.map(r => r.menuItemName);
    const limited = limit === "all" ? allRecNames : allRecNames.slice(0, limit);
    setSelectedRecipes(new Set(limited));
    setCurrentStep("preview");
  };

  const executePreview = async (file: File): Promise<string | null> => {
    try {
      const response = await previewCb.execute(file);
      if (response?.data?.response) {
        const preview = response.data.response;
        setPreviewData(preview);
        setSelectedRecipes(new Set(preview.recipes.map(r => r.menuItemName)));
        setCurrentStep("config");
        return null;
      }
      return "Failed to analyze the file. Please try again.";
    } catch (error) {
      const msg =
        Array.isArray(error) && typeof error[0] === "string"
          ? error[0]
          : "Failed to analyze the file. Please try again.";
      return msg;
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
    setCurrentStep("info");
    setSelectedFile(null);
    setPreviewData(null);
    setSelectedRecipes(new Set());
    setResultData(null);
    setRecipeLimit("all");
  };

  const value: RecipeImportContextValue = useMemo(
    () => ({
      currentStep,
      selectedFile,
      previewData,
      selectedRecipes,
      resultData,
      recipeLimit,
      previewLoading: previewCb.loading,
      importLoading: importCb.loading,
      setCurrentStep,
      setSelectedFile,
      setRecipeLimit,
      applyLimitsAndPreview,
      toggleRecipe,
      updateRecipe,
      executePreview,
      executeImport,
      reset,
    }),
    [
      currentStep,
      selectedFile,
      previewData,
      selectedRecipes,
      resultData,
      recipeLimit,
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

const GoToHistoryContext = createContext<(() => void) | undefined>(undefined);
export const useGoToHistory = () => useContext(GoToHistoryContext);
export const GoToHistoryProvider: React.FC<{ onGoToHistory?: () => void; children: React.ReactNode }> = ({ onGoToHistory, children }) => (
  <GoToHistoryContext.Provider value={onGoToHistory}>{children}</GoToHistoryContext.Provider>
);
