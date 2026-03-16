import { useBaseForm } from "../../../../core/hooks/useBaseForm";
import { RecipeForm as RecipeFormType, recipeFormSchema } from "../validation";
import { SUBMISSION_KEYS } from "../constants";

interface UseRecipeFormProps {
  initialValues?: Partial<RecipeFormType>;
  resetForm?: boolean;
  isEdit: boolean;
  isInDialog: boolean;
  onSubmit: (values: RecipeFormType) => void;
}

const defaultValues: RecipeFormType = {
  menuItemProductID: "",
  recipeItems: [],
  notes: null,
};

export const useRecipeForm = ({
  initialValues,
  resetForm,
  isEdit,
  isInDialog,
  onSubmit,
}: UseRecipeFormProps) => {
  const submissionKey = isEdit ? SUBMISSION_KEYS.edit : SUBMISSION_KEYS.create;

  const form = useBaseForm<RecipeFormType>({
    schema: recipeFormSchema,
    defaultValues,
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
    submissionKey,
  });

  const { watch } = form;
  const watchedValues = {
    menuItemId: watch("menuItemProductID"),
    recipeItems: watch("recipeItems"),
  };

  return {
    ...form,
    watchedValues,
    submissionKey,
  };
};
