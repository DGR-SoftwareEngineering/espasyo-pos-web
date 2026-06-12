export type RecipeImportStepKey = "Upload" | "Preview" | "Result";

export interface RecipeImportStepProps {
  next: () => void;
  previous: () => void;
  reset: () => void;
}
