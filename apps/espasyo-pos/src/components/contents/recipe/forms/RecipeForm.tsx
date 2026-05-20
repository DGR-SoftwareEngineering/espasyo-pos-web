import React, { useMemo, useState } from "react";
import {
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  NotesOutlined,
  AddCircleOutlineOutlined,
  FastfoodOutlined,
} from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { InfoBox } from "core-lib/components/radix/InfoBox";
import { RecipeFormProps } from "./types";
import { useRecipeForm, useIngredientForm } from "../hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { IngredientAddForm, IngredientListItem } from "../../../../components";
import { SelectOption } from "core-lib/components/radix/form/SelectField";

export const RecipeForm: React.FC<RecipeFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  ingredients,
  menuItems,
  units,
  onMenuItemSelect,
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

  console.log('ingredients', ingredients)

  const menuItemOptions = useMemo(
    () => toSelectOptionsWithField(menuItems, "productID", "name"),
    [menuItems],
  );

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
          <FormSection
            icon={<RestaurantMenuOutlined style={{ color: "var(--accent-11)" }} />}
            title="Select Menu Item"
          >
            <SelectField
              name="menuItemProductID"
              control={control}
              options={menuItemOptions}
              label="Menu Item"
              onSelectOption={(option: SelectOption) =>
                onMenuItemSelect?.(option.value)
              }
            />
            {errors.menuItemProductID && (
              <Text size="1" color="red" as="div" mt="1">
                {errors.menuItemProductID.message}
              </Text>
            )}
          </FormSection>

          <Separator size="4" />

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
        buttonText={isEdit ? "Update Recipe" : "Create Recipe"}
        submissionKey={submissionKey}
      />
    </Card>
  );
};
