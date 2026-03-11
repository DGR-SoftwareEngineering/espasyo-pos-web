import { useToastContext } from "core-lib";
import React, { useState } from "react";
import { CategoryForm } from "./CategoryForm";
import { CategoryForm as CategoryFormType } from "./validation";
import { useApiCallback } from "core-lib/core/hooks";

export const CategoryFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const { showToast } = useToastContext();
  const categoryCb = useApiCallback(
    async (api, args: CategoryFormType) =>
      await api.commons.createNewCategory(args),
  );

  return (
    <CategoryForm
      submitLoading={loading || categoryCb.loading}
      resetForm={resetForm}
      onSubmit={handleSubmit}
    />
  );

  async function handleSubmit(data: CategoryFormType) {
    try {
      setLoading(true);
      const result = await categoryCb.execute(data);
      if (result.status === 200 || result.data.success) {
        showToast("Successfully Added", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      }
    } catch (error) {
      const errors = error as string[];
      console.error(`Problem during creation: ${errors}`);
      showToast("Invalid username or password", "error");
    } finally {
      setLoading(false);
    }
  }
};
