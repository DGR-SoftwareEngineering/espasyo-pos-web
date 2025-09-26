import { useCheckboxFormState } from "./form";

export const useCheckboxState = () => {
  const form = useCheckboxFormState();
  return { ...form };
};
