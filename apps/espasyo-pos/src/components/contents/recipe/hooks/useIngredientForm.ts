import { useForm } from "react-hook-form";
import { NewIngredient } from "../forms/types";

export const useIngredientForm = () => {
  return useForm<NewIngredient>({
    defaultValues: {
      ingredientProductID: "",
      quantityRequired: 1,
      unitID: "",
      displayOrder: 1,
      notes: "",
    },
  });
};
