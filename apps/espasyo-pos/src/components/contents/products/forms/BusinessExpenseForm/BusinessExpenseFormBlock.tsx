import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { BusinessExpenseForm } from "./BusinessExpenseForm";
import { BusinessExpenseForm as BusinessExpenseFormType } from "./validation";
import { useApiCallback, useApi } from "core-lib/core/hooks";
import {
  BusinessSupplyCategoryDto,
  CreateBusinessExpenseParams,
} from "core-lib/api/commons/types";

export const BusinessExpenseFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [businessSupplyCategories, setBusinessSupplyCategories] = useState<
    BusinessSupplyCategoryDto[]
  >([]);
  const { showToast } = useToastContext();

  const businessSupplyCategoryData = useApi((api) =>
    api.commons.businessSupplyCategoryList(),
  );

  const expenseCb = useApiCallback(
    async (api, args: CreateBusinessExpenseParams) =>
      await api.commons.createBusinessExpense(args),
  );

  useEffect(() => {
    setBusinessSupplyCategories(
      businessSupplyCategoryData.result?.data.response ?? [],
    );
  }, [businessSupplyCategoryData.result?.data.response]);

  const handleSubmit = async (formData: BusinessExpenseFormType) => {
    try {
      setLoading(true);

      const payload: CreateBusinessExpenseParams = {
        expenseDate: formData.expenseDate,
        amount: formData.amount!,
        description: formData.description,
        notes: formData.notes || null,
        businessSupplyCategoryID: formData.businessSupplyCategoryID || null,
      };

      const result = await expenseCb.execute(payload);

      if (result.status >= 200 && result.status < 300) {
        showToast("Expense recorded successfully", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      } else {
        const errMessage =
          (Array.isArray(result.data.errors)
            ? (result.data.errors as string[])[0]
            : null) ??
          result.data.message ??
          "Failed to record expense";
        showToast(errMessage, "error");
      }
    } catch (error) {
      console.error("Error recording expense:", error);
      showToast("Failed to record expense", "error");
    } finally {
      setLoading(false);
    }
  };

  const lookupsLoading = businessSupplyCategoryData.loading;

  return (
    <BusinessExpenseForm
      submitLoading={loading || lookupsLoading}
      resetForm={resetForm}
      onSubmit={handleSubmit}
      isInDialog={false}
      businessSupplyCategories={businessSupplyCategories}
      lookupsLoading={lookupsLoading}
    />
  );
};
