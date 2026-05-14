import React from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import {
  Inventory2Outlined,
  KitchenOutlined,
  TuneOutlined,
  InfoOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { AutoCompleteField } from "core-lib/components/radix/form/AutoCompleteField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { ProductDataList } from "core-lib/api/commons/types";
import { getStockStatus } from "core-lib/business/number";
import { useInventoryForm } from "../hooks";
import { PLACEHOLDERS } from "../constants";
import { InventoryFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  productID: "Ingredient",
  currentQuantity: "Current Quantity",
  reorderLevel: "Reorder Level",
  minimumStockLevel: "Minimum Stock Level",
};

type ProjectedStatus = {
  label: string;
  color: "green" | "amber" | "red";
  icon: React.ReactNode;
};

export const InventoryForm: React.FC<InventoryFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  ingredients,
  ingredientsLoading,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
  } = useInventoryForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const selectedIngredient = React.useMemo(
    () => ingredients.find((p) => p.productID === watchedValues.productID),
    [ingredients, watchedValues.productID],
  );

  const projectedStatus = React.useMemo<ProjectedStatus | null>(() => {
    const { isNormal, isLow, isCritical } = getStockStatus(
      watchedValues.currentQuantity,
      watchedValues.reorderLevel,
      watchedValues.minimumStockLevel,
    );
    if (watchedValues.currentQuantity <= 0)
      return {
        label: "Out of Stock",
        color: "red",
        icon: <ErrorOutlineOutlined fontSize="small" />,
      };
    if (isCritical)
      return {
        label: "Critical",
        color: "red",
        icon: <ErrorOutlineOutlined fontSize="small" />,
      };
    if (isLow)
      return {
        label: "Low Stock",
        color: "amber",
        icon: <WarningAmberOutlined fontSize="small" />,
      };
    if (isNormal)
      return {
        label: "In Stock",
        color: "green",
        icon: <CheckCircleOutlined fontSize="small" />,
      };
    return null;
  }, [
    watchedValues.currentQuantity,
    watchedValues.reorderLevel,
    watchedValues.minimumStockLevel,
  ]);

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => handleFormSubmit();

  return (
    <Card variant="surface" size="3" style={{ width: "100%" }}>
      <FormHeader
        isEdit={isEdit}
        title="Inventory"
        editTitle="Edit Inventory"
        subtitle="Initialize tracking for an ingredient. Use Adjust Stock afterwards to move quantities."
        editSubtitle="Update inventory thresholds"
        icon={Inventory2Outlined}
      />

      {selectedIngredient && (
        <Box
          px="4"
          py="3"
          style={{
            background: "var(--accent-a2)",
            borderBottom: "1px solid var(--accent-a4)",
          }}
        >
          <Flex
            direction={{ initial: "column", sm: "row" }}
            justify="between"
            align={{ initial: "start", sm: "center" }}
            gap="2"
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--accent-a3)",
                  color: "var(--accent-11)",
                }}
              >
                <KitchenOutlined />
              </Box>
              <Box>
                <Heading size="3" weight="bold">
                  {selectedIngredient.name}
                </Heading>
                <Text size="1" color="gray">
                  {selectedIngredient.categoryName ?? "Uncategorized"} ·
                  Ingredient
                </Text>
              </Box>
            </Flex>
            {projectedStatus && (
              <Badge
                color={projectedStatus.color}
                variant="soft"
                size="2"
                radius="medium"
              >
                {projectedStatus.icon}
                Projected: {projectedStatus.label}
              </Badge>
            )}
          </Flex>
        </Box>
      )}

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<KitchenOutlined style={{ color: "var(--accent-11)" }} />}
            title="Ingredient"
            description="Only ingredients (non-menu items) with a stock unit can have inventory."
          >
            <AutoCompleteField<typeof watchedValues, ProductDataList>
              name="productID"
              control={control}
              options={ingredients}
              loading={ingredientsLoading}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.productID}
              placeholder={PLACEHOLDERS.productSearch}
              label="Select Ingredient"
              disableClearable={false}
              noOptionText="No matching ingredients"
            />
          </FormSection>

          <FormSection
            icon={<TuneOutlined style={{ color: "var(--blue-11)" }} />}
            title="Stock Levels"
            description="Set the initial quantity and the thresholds that drive low-stock and critical statuses."
          >
            <Grid columns={{ initial: "1", md: "3" }} gap="3">
              <Box>
                <TextField
                  name="currentQuantity"
                  control={control}
                  label="Current Quantity"
                  type="number"
                  placeholder={PLACEHOLDERS.currentQuantity}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Opening balance — use 0 if stock will be received later.
                </Text>
              </Box>

              <Box>
                <TextField
                  name="reorderLevel"
                  control={control}
                  label="Reorder Level"
                  type="number"
                  placeholder={PLACEHOLDERS.reorderLevel}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Triggers "Low Stock" when quantity drops to this level.
                </Text>
              </Box>

              <Box>
                <TextField
                  name="minimumStockLevel"
                  control={control}
                  label="Minimum Stock Level"
                  type="number"
                  placeholder={PLACEHOLDERS.minimumStockLevel}
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Triggers "Critical" when quantity drops to this level.
                </Text>
              </Box>
            </Grid>
          </FormSection>

          <Callout.Root color="blue" variant="soft">
            <Callout.Icon>
              <InfoOutlined style={{ fontSize: 18 }} />
            </Callout.Icon>
            <Callout.Text>
              <strong>How status is computed:</strong>
              <br />• <strong>In Stock</strong> when quantity is above the
              reorder level
              <br />• <strong>Low Stock</strong> when quantity is at or below
              the reorder level
              <br />• <strong>Critical</strong> when quantity is at or below the
              minimum level
              <br />• <strong>Out of Stock</strong> when quantity reaches zero
            </Callout.Text>
          </Callout.Root>
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
        buttonText={isEdit ? "Update Inventory" : "Create Inventory"}
      />
    </Card>
  );
};
