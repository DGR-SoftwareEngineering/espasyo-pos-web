import { ProductDataList, UnitDto } from "core-lib/api/commons/types";
import { RecipeForm as RecipeFormType } from "./validation";

export type RecipeTarget =
  | { type: "base"; productId: string; productName: string }
  | { type: "variant"; productId: string; productName: string; variantId: string; variantName: string }
  | { type: "addon"; productId: string; productName: string; addOnItemId: string; addOnItemName: string };

export interface RecipeFormProps {
  onSubmit: (values: RecipeFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
  initialValues?: Partial<RecipeFormType>;
  isEdit?: boolean;
  isInDialog: boolean;
  ingredients: ProductDataList[];
  units: UnitDto[];
  recipeTarget?: RecipeTarget;
  submitLabel?: string;
}

export interface NewIngredient {
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes: string;
}
