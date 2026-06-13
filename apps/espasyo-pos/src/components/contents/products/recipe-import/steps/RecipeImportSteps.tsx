export type RecipeImportStepKey = "Info" | "Upload" | "Config" | "Preview" | "Result";

export interface RecipeImportStepProps {
  next: () => void;
  previous: () => void;
  reset: () => void;
}
