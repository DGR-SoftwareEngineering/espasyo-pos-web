import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
  TextArea,
} from "@radix-ui/themes";
import {
  DeleteOutline,
  KitchenOutlined,
  AddCircleOutlineOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { Button } from "core-lib/components/radix/buttons/Button";
import { DialogBox } from "core-lib/components/radix/dialog/DialogBox";
import { useToastContext } from "core-lib";
import { useApi, useApiCallback } from "core-lib/core/hooks";
import { toSelectOptionsWithField } from "core-lib/business/array";
import type {
  ProductDataList,
  UnitDto,
  AddOnItemRecipeItemResponse,
  CreateAddOnItemRecipeParams,
  UpdateAddOnItemRecipeParams,
} from "core-lib/api/commons/types";
import { IngredientAddForm } from "../../../IngredientAddForm";
import { useIngredientForm } from "../../recipe/hooks";

interface RecipeItem {
  ingredientProductID: string;
  quantityRequired: number;
  unitID: string;
  displayOrder: number;
  notes: string;
}

interface AddOnItemRecipeDialogProps {
  addOnItemId: string;
  addOnItemName: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AddOnItemRecipeDialog: React.FC<AddOnItemRecipeDialogProps> = ({
  addOnItemId,
  addOnItemName,
  open,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToastContext();

  const [existingRecipeId, setExistingRecipeId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addForm = useIngredientForm();

  const ingredientsApi = useApi((api) =>
    api.commons.getProductByIngredientsOrMenu(false),
  );
  const unitsApi = useApi((api) => api.commons.unitList());

  const loadRecipeCb = useApiCallback(
    async (api, id: string) => api.commons.getAddOnItemRecipeByItem(id),
  );
  const createCb = useApiCallback(
    async (api, params: CreateAddOnItemRecipeParams) =>
      api.commons.createAddOnItemRecipe(params),
  );
  const updateCb = useApiCallback(
    async (api, params: UpdateAddOnItemRecipeParams) =>
      api.commons.updateAddOnItemRecipe(params),
  );
  const deleteCb = useApiCallback(
    async (api, id: string) => api.commons.deleteAddOnItemRecipe(id),
  );

  const ingredients: ProductDataList[] =
    ingredientsApi.result?.data.response ?? [];
  const units: UnitDto[] = unitsApi.result?.data.response ?? [];

  useEffect(() => {
    if (!open) {
      setExistingRecipeId(null);
      setNotes("");
      setItems([]);
      setShowAddForm(false);
      setShowDeleteConfirm(false);
      addForm.reset();
      return;
    }

    const load = async () => {
      setDataLoading(true);
      try {
        const result = await loadRecipeCb.execute(addOnItemId);
        if (result.data.success && result.data.response) {
          const recipe = result.data.response;
          setExistingRecipeId(recipe.addOnItemRecipeID);
          setNotes(recipe.notes ?? "");
          setItems(
            [...recipe.recipeItems]
              .sort(
                (
                  a: AddOnItemRecipeItemResponse,
                  b: AddOnItemRecipeItemResponse,
                ) => a.displayOrder - b.displayOrder,
              )
              .map((item: AddOnItemRecipeItemResponse) => ({
                ingredientProductID: item.ingredientProductID,
                quantityRequired: item.quantityRequired,
                unitID: item.unitID,
                displayOrder: item.displayOrder,
                notes: item.notes ?? "",
              })),
          );
        } else {
          setExistingRecipeId(null);
          setNotes("");
          setItems([]);
        }
      } catch {
        setExistingRecipeId(null);
        setNotes("");
        setItems([]);
      } finally {
        setDataLoading(false);
      }
    };

    load();
  }, [open, addOnItemId]);

  const ingredientOptions = useMemo(
    () => toSelectOptionsWithField(ingredients, "productID", "name"),
    [ingredients],
  );

  const unitOptions = useMemo(
    () =>
      toSelectOptionsWithField(units, "unitID", "name").map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    [units],
  );

  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.productID === id)?.name ?? id;

  const getUnitName = (id: string) =>
    units.find((u) => u.unitID === id)?.name ?? id;

  const handleAddIngredient = () => {
    const values = addForm.getValues();
    if (!values.ingredientProductID || !values.unitID) return;

    setItems((prev) => [
      ...prev,
      {
        ingredientProductID: values.ingredientProductID,
        quantityRequired: Number(values.quantityRequired),
        unitID: values.unitID,
        displayOrder: Number(values.displayOrder),
        notes: values.notes,
      },
    ]);

    addForm.reset({
      ingredientProductID: "",
      quantityRequired: 1,
      unitID: "",
      displayOrder: items.length + 2,
      notes: "",
    });
    setShowAddForm(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      showToast("Add at least one ingredient", "error");
      return;
    }

    setSaving(true);
    try {
      const recipeItems = items.map((item) => ({
        ingredientProductID: item.ingredientProductID,
        quantityRequired: item.quantityRequired,
        unitID: item.unitID,
        displayOrder: item.displayOrder,
        notes: item.notes || null,
      }));

      if (existingRecipeId) {
        const result = await updateCb.execute({
          addOnItemRecipeID: existingRecipeId,
          notes: notes || null,
          recipeItems,
        });
        if (result.data.success) {
          showToast("Add-on recipe updated", "success");
          onSaved?.();
          onClose();
        } else {
          showToast(result.data.message || "Failed to update recipe", "error");
        }
      } else {
        const result = await createCb.execute({
          productAddOnItemID: addOnItemId,
          notes: notes || null,
          recipeItems,
        });
        if (result.data.success) {
          showToast("Add-on recipe created", "success");
          onSaved?.();
          onClose();
        } else {
          showToast(result.data.message || "Failed to create recipe", "error");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRecipeId) return;
    setDeleting(true);
    try {
      const result = await deleteCb.execute(existingRecipeId);
      if (result.data.success) {
        showToast("Add-on recipe deleted", "success");
        onSaved?.();
        onClose();
      } else {
        showToast(result.data.message || "Failed to delete recipe", "error");
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isEditMode = !!existingRecipeId;
  const isLoading = dataLoading || ingredientsApi.loading || unitsApi.loading;
  const isBusy = saving || deleting;

  return (
    <DialogBox
      open={open}
      onClose={(_, reason) => {
        if (isBusy && reason !== "closeClick") return;
        onClose();
      }}
      title={
        isEditMode
          ? `Edit Recipe: ${addOnItemName}`
          : `Add Recipe: ${addOnItemName}`
      }
      subtitle="Define extra ingredient deductions when this add-on is selected"
      maxWidth="md"
      loading={isLoading}
      actions={
        <Flex gap="2" align="center" style={{ width: "100%" }}>
          {isEditMode && !showDeleteConfirm && (
            <Button
              type="Critical"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isBusy}
            >
              Delete Recipe
            </Button>
          )}
          {isEditMode && showDeleteConfirm && (
            <>
              <Text size="2" color="red" style={{ flex: 1 }}>
                Delete this add-on recipe?
              </Text>
              <Button
                type="Secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                No
              </Button>
              <Button
                type="Critical"
                onClick={handleDelete}
                disabled={deleting}
              >
                Yes, delete
              </Button>
            </>
          )}
          {!showDeleteConfirm && (
            <Box
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "var(--space-2)",
              }}
            >
              <Button type="Secondary" onClick={onClose} disabled={isBusy}>
                Cancel
              </Button>
              <Button
                type="Primary"
                onClick={handleSave}
                disabled={isBusy || items.length === 0}
              >
                {isEditMode ? "Update Recipe" : "Save Recipe"}
              </Button>
            </Box>
          )}
        </Flex>
      }
    >
      <Flex direction="column" gap="4">
        <Box>
          <Flex justify="between" align="center" mb="3">
            <Flex align="center" gap="2">
              <KitchenOutlined style={{ color: "var(--green-11)" }} />
              <Heading size="3" weight="bold">
                Ingredients ({items.length})
              </Heading>
            </Flex>
            <Flex
              align="center"
              gap="1"
              style={{ cursor: "pointer", color: "var(--accent-11)" }}
              onClick={() => setShowAddForm((p) => !p)}
            >
              <AddCircleOutlineOutlined fontSize="small" />
              <Text size="2">{showAddForm ? "Cancel" : "Add Ingredient"}</Text>
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

          {items.length === 0 ? (
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
                No ingredients yet. Click "Add Ingredient" to start.
              </Text>
            </Box>
          ) : (
            <Flex direction="column" gap="2">
              {[...items]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item, index) => (
                  <Box
                    key={`${item.ingredientProductID}-${index}`}
                    p="3"
                    style={{
                      background: "var(--color-panel-solid)",
                      border: "1px solid var(--accent-a5)",
                      borderRadius: "var(--radius-3)",
                    }}
                  >
                    <Box
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 2.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.5fr) auto",
                        gap: "var(--space-3)",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Text size="1" color="gray" as="div">
                          Ingredient
                        </Text>
                        <Text size="2" weight="medium" as="div">
                          {getIngredientName(item.ingredientProductID)}
                        </Text>
                      </Box>
                      <Box>
                        <Text size="1" color="gray" as="div">
                          Quantity
                        </Text>
                        <Badge color="blue" variant="soft" radius="medium" mt="1">
                          {Number(item.quantityRequired).toFixed(3)}
                        </Badge>
                      </Box>
                      <Box>
                        <Text size="1" color="gray" as="div">
                          Unit
                        </Text>
                        <Text size="2" as="div">
                          {getUnitName(item.unitID)}
                        </Text>
                      </Box>
                      <Box>
                        <Flex align="center" gap="1">
                          <Text size="1" color="gray">
                            Order:
                          </Text>
                          <Badge color="indigo" variant="soft" radius="medium">
                            {item.displayOrder}
                          </Badge>
                        </Flex>
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="1" color="gray" as="div">
                          Notes
                        </Text>
                        <Text
                          size="1"
                          color="gray"
                          as="div"
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.notes || "—"}
                        </Text>
                      </Box>
                      <IconButton
                        color="red"
                        variant="soft"
                        size="2"
                        onClick={() => handleRemoveItem(index)}
                        aria-label="Remove ingredient"
                      >
                        <DeleteOutline style={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
            </Flex>
          )}
        </Box>

        <Separator size="4" />

        <Box>
          <Text
            as="label"
            size="2"
            weight="medium"
            mb="1"
            style={{ display: "block" }}
          >
            Notes (Optional)
          </Text>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for this add-on recipe..."
            rows={3}
          />
        </Box>

        <Callout.Root color="indigo" variant="soft">
          <Callout.Icon>
            <InfoOutlined style={{ fontSize: 18 }} />
          </Callout.Icon>
          <Callout.Text>
            <strong>Additive recipe:</strong> When this add-on is selected,
            these ingredients are deducted in addition to the main item's recipe
            ingredients.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    </DialogBox>
  );
};
