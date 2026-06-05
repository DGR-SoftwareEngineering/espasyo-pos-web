import React from "react";
import { Box, Card, Flex, Grid, Text } from "@radix-ui/themes";
import {
  DescriptionOutlined,
  InfoOutlined,
  LocalShippingOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { Button } from "core-lib/components/radix/buttons/Button";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { useBusinessExpenseForm } from "../../hooks/useBusinessExpenseForm";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { formatPrice } from "core-lib/business/strings";
import { BusinessExpenseFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  expenseDate: "Expense Date",
  amount: "Amount",
  description: "Description",
  notes: "Notes",
  businessSupplyCategoryID: "Category",
};

const PLACEHOLDERS = {
  expenseDate: "2026-05-21",
  amount: "1500.00",
  description: "Bought 2 plastic tables for seating area",
  notes: "Placed near window",
};

export const BusinessExpenseForm: React.FC<BusinessExpenseFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  businessSupplyCategories,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
    watch,
  } = useBusinessExpenseForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => handleFormSubmit();

  const categoryOptions = React.useMemo(
    () =>
      toSelectOptionsWithField(
        businessSupplyCategories ?? [],
        "businessSupplyCategoryID",
        "name",
      ),
    [businessSupplyCategories],
  );

  const selectedCategory = React.useMemo(() => {
    if (!watchedValues.businessSupplyCategoryID) return undefined;
    const cat = businessSupplyCategories?.find(
      (c) => c.businessSupplyCategoryID === watchedValues.businessSupplyCategoryID,
    );
    return cat
      ? { categoryID: cat.businessSupplyCategoryID, name: cat.name }
      : undefined;
  }, [businessSupplyCategories, watchedValues.businessSupplyCategoryID]);

  return (
    <Card variant="surface" size="3" style={{ width: "100%" }}>
      <FormHeader
        isEdit={isEdit}
        title="Business Expense"
        editTitle="Edit Business Expense"
        subtitle="Record a direct business purchase or overhead cost"
        editSubtitle="Update expense details"
        icon={ReceiptOutlined}
      />

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<DescriptionOutlined style={{ color: "var(--accent-11)" }} />}
            title="Expense Information"
          >
            <Flex direction="column" gap="3">
              <Box>
                <TextField
                  name="expenseDate"
                  control={control}
                  label="Expense Date"
                  type="date"
                  placeholder={PLACEHOLDERS.expenseDate}
                />
              </Box>

              <Box>
                <TextField
                  name="description"
                  control={control}
                  label="Description"
                  placeholder={PLACEHOLDERS.description}
                  multiline
                  rows={2}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  What was purchased (e.g., tables, cleaning supplies)
                </Text>
              </Box>

              <Box>
                <TextField
                  name="amount"
                  control={control}
                  label="Amount"
                  type="number"
                  placeholder={PLACEHOLDERS.amount}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Total amount spent
                </Text>
              </Box>

              <Box>
                <TextField
                  name="notes"
                  control={control}
                  label="Notes (Optional)"
                  placeholder={PLACEHOLDERS.notes}
                  multiline
                  rows={2}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Any additional details about this expense
                </Text>
              </Box>
            </Flex>
          </FormSection>

          <FormSection
            icon={<LocalShippingOutlined style={{ color: "var(--amber-11)" }} />}
            title="Category"
          >
            <SelectField
              name="businessSupplyCategoryID"
              control={control}
              options={categoryOptions}
              label="Business Supply Category (Optional)"
            />
            <Text size="1" color="gray" as="div" mt="2">
              Categorize this expense for better tracking and reporting
            </Text>
          </FormSection>

          <Box
            p="3"
            style={{
              background: "var(--teal-a2)",
              border: "1px solid var(--teal-a5)",
              borderRadius: "var(--radius-3)",
            }}
          >
            <Flex align="start" gap="2">
              <InfoOutlined
                style={{
                  color: "var(--teal-11)",
                  fontSize: 18,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <Text size="2" color="gray">
                Direct expenses recorded here will appear in your financial
                report under <strong>Business Supply Expenses</strong>. No
                inventory tracking or recipe linking — useful for overhead
                costs like furniture, cleaning supplies, and office equipment.
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      <FormActions
        isEdit={isEdit}
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={submissionKey}
        onButtonClick={handleButtonClick}
        buttonText={isEdit ? "Update Expense" : "Record Expense"}
      />
    </Card>
  );
};
