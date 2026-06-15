import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  KitchenOutlined,
  NotesOutlined,
  AddCircleOutlineOutlined,
  FastfoodOutlined,
  RestaurantMenuOutlined,
  LayersOutlined,
  ExtensionOutlined,
} from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { InfoBox } from "core-lib/components/radix/InfoBox";
import { RecipeFormProps } from "./types";
import type { RecipeForm as RecipeFormType } from "./validation";
import { useRecipeForm, useIngredientForm } from "../hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { IngredientAddForm, IngredientListItem } from "../../../../components";

export const RecipeForm: React.FC<RecipeFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  ingredients,
  units,
  recipeTarget,
  submitLabel,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const addForm = useIngredientForm();

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    isDirty,
    submissionKey,
  } = useRecipeForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipeItems",
  });

  const ingredientOptions = useMemo(
    () => toSelectOptionsWithField(ingredients, "productID", "name"),
    [ingredients],
  );

  const unitOptions = useMemo(
    () =>
      toSelectOptionsWithField(units ?? [], "unitID", "name").map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    [units],
  );

  const handleAddIngredient = () => {
    const values = addForm.getValues();
    if (!values.ingredientProductID || !values.unitID) return;

    append({
      ingredientProductID: values.ingredientProductID,
      quantityRequired: Number(values.quantityRequired),
      unitID: values.unitID,
      displayOrder: Number(values.displayOrder),
      notes: values.notes,
    });

    addForm.reset({
      ingredientProductID: "",
      quantityRequired: 1,
      unitID: "",
      displayOrder: fields.length + 1,
      notes: "",
    });
    setShowAddForm(false);
  };

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => handleFormSubmit();

  const targetLabel = recipeTarget
    ? recipeTarget.type === "base"
      ? `Base recipe — ${recipeTarget.productName}`
      : recipeTarget.type === "variant"
        ? `${recipeTarget.productName} › ${recipeTarget.variantName}`
        : `${recipeTarget.productName} › ${recipeTarget.addOnItemName} (add-on)`
    : null;

  const targetIcon =
    recipeTarget?.type === "variant" ? (
      <LayersOutlined style={{ fontSize: 16 }} />
    ) : recipeTarget?.type === "addon" ? (
      <ExtensionOutlined style={{ fontSize: 16 }} />
    ) : (
      <RestaurantMenuOutlined style={{ fontSize: 16 }} />
    );

  const targetColor =
    recipeTarget?.type === "variant"
      ? "indigo"
      : recipeTarget?.type === "addon"
        ? "purple"
        : "blue";

  return (
    <Card variant="surface" size="3" style={{ width: "100%" }}>
      <FormHeader
        isEdit={isEdit}
        title="Recipe"
        editTitle="Edit Recipe"
        subtitle="Define what goes into your menu items"
        editSubtitle="Update ingredients and quantities"
        icon={FastfoodOutlined}
      />

      <Box p="4">
        <Flex direction="column" gap="4">
          {/* Target breadcrumb */}
          {targetLabel && (
            <Callout.Root color={targetColor} variant="soft" size="1">
              <Callout.Icon>{targetIcon}</Callout.Icon>
              <Callout.Text>
                <strong>{targetLabel}</strong>
              </Callout.Text>
            </Callout.Root>
          )}

          <Box>
            <Flex justify="between" align="center" mb="3">
              <Flex align="center" gap="2">
                <KitchenOutlined style={{ color: "var(--green-11)" }} />
                <Heading size="3" weight="bold">
                  Ingredients ({fields.length})
                </Heading>
              </Flex>
              <Flex
                align="center"
                gap="1"
                style={{
                  cursor: "pointer",
                  color: "var(--accent-11)",
                }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <AddCircleOutlineOutlined fontSize="small" />
                <Text size="2">
                  {showAddForm ? "Cancel" : "Add Ingredient"}
                </Text>
              </Flex>
            </Flex>

            {showAddForm && (
              <IngredientAddForm
                form={addForm}
                ingredientOptions={ingredientOptions}
                unitOptions={unitOptions}
                onAdd={handleAddIngredient}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {errors.recipeItems?.message && (
              <Callout.Root color="red" variant="soft" mb="2">
                <Callout.Text>{errors.recipeItems.message}</Callout.Text>
              </Callout.Root>
            )}

            {fields.length === 0 ? (
              <Box
                p="5"
                style={{
                  textAlign: "center",
                  background: "var(--blue-a2)",
                  border: "1px solid var(--blue-a4)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <KitchenOutlined
                  style={{
                    fontSize: 48,
                    color: "var(--gray-10)",
                    marginBottom: 12,
                  }}
                />
                <Text as="div" color="gray">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </Text>
              </Box>
            ) : (
              <Flex direction="column" gap="2">
                {fields
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field, index) => (
                    <IngredientListItem
                      key={field.id}
                      field={field}
                      index={index}
                      ingredients={ingredients}
                      units={units}
                      onRemove={remove}
                    />
                  ))}
              </Flex>
            )}
          </Box>

          <Separator size="4" />

          <FormSection
            icon={<NotesOutlined style={{ color: "var(--purple-11)" }} />}
            title="Recipe Notes (Optional)"
          >
            <TextField
              name="notes"
              control={control}
              label="Notes"
              placeholder="Add any special instructions for this recipe..."
              multiline
              rows={3}
            />
          </FormSection>

          <InfoBox title="How recipes work">
            Recipes define the ingredients and quantities required to produce
            one unit of a menu item. The system uses this to compute cost-per-
            serving and to deduct stock from inventory each time a sale is
            recorded.
          </InfoBox>
        </Flex>
      </Box>

      <FormActions
        isEdit={isEdit}
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        onButtonClick={handleButtonClick}
        isInDialog={isInDialog}
        buttonText={submitLabel ?? (isEdit ? "Update Recipe" : "Create Recipe")}
        submissionKey={submissionKey}
      />
    </Card>
  );
};
