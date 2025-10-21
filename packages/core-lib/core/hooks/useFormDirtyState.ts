import { useEffect, useState } from "react";
import { FormState } from "react-hook-form";

export const useFormDirtyState = (formState: FormState<{}>) => {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (formState.isDirty) {
      setIsDirty(true);
    }

    return () => {
      setIsDirty(false);
    };
  }, [formState.isDirty]);

  return { isDirty, setIsDirty };
};
