import React, { useMemo, useState } from "react";
import {
  Grid,
  CardContent,
  Box,
  Typography,
  useTheme,
  Divider,
  alpha,
} from "@mui/material";
import {
  Card,
  SelectField,
  TextField,
  FormSection,
  FormActions,
  InfoBox,
} from "core-lib";
import {
  RestaurantMenuOutlined,
  KitchenOutlined,
  NotesOutlined,
  AddCircleOutlineOutlined,
  FastfoodOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import { RecipeFormProps } from "./types";
import { useRecipeForm } from "./hooks/useRecipeForm";
import { useIngredientForm } from "./hooks/useIngredientForm";
import { toSelectOptions, toUnitOptions } from "./utils";
import { FormHeader } from "../../FormHeader";
import { IngredientAddForm } from "./components/IngredientAddForm";
import { IngredientListItem } from "./components/IngredientListItem";

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
}) => {
  const theme = useTheme();
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

  const menuItemOptions = useMemo(
    () => toSelectOptions(menuItems),
    [menuItems],
  );

  const ingredientOptions = useMemo(
    () => toSelectOptions(ingredients),
    [ingredients],
  );

  const unitOptions = useMemo(() => toUnitOptions(units), [units]);

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
  const handleButtonClick = () => {
    if (isValid && (isDirty || isEdit)) {
      handleFormSubmit();
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
      }}
    >
      <FormHeader
        isEdit={isEdit}
        title="Recipe"
        editTitle="Edit Recipe"
        subtitle="Define what goes into your menu items"
        editSubtitle="Update ingredients and quantities"
        icon={FastfoodOutlined}
      />

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Menu Item Selection */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<RestaurantMenuOutlined color="primary" />}
              title="Select Menu Item"
            >
              <SelectField
                name="menuItemProductID"
                control={control}
                options={menuItemOptions}
                label="Menu Item"
              />
              {errors.menuItemProductID && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.menuItemProductID.message}
                </Typography>
              )}
            </FormSection>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Ingredients Section */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <KitchenOutlined color="success" />
                Ingredients ({fields.length})
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  color: theme.palette.primary.main,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <AddCircleOutlineOutlined fontSize="small" />
                <Typography variant="body2">
                  {showAddForm ? "Cancel" : "Add Ingredient"}
                </Typography>
              </Box>
            </Box>

            {showAddForm && (
              <IngredientAddForm
                form={addForm}
                ingredientOptions={ingredientOptions}
                unitOptions={unitOptions}
                onAdd={handleAddIngredient}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {/* Display duplicate ingredient error */}
            {errors.recipeItems?.message && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <InfoOutlined sx={{ color: theme.palette.error.main }} />
                <Typography variant="body2" color="error">
                  {errors.recipeItems.message}
                </Typography>
              </Box>
            )}

            {fields.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.02),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                <KitchenOutlined
                  sx={{
                    fontSize: 48,
                    color: theme.palette.text.secondary,
                    mb: 2,
                  }}
                />
                <Typography color="text.secondary">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Notes Section */}
          <Grid size={{ xs: 12 }}>
            <FormSection
              icon={<NotesOutlined color="secondary" />}
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
          </Grid>

          {/* Info Box */}
          <Grid size={{ xs: 12 }}>
            <InfoBox />
          </Grid>
        </Grid>
      </CardContent>

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
