import React, { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Separator,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Select,
} from "@radix-ui/themes";;
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import {
  type Control,
  type UseFormWatch,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { ImageUploadField } from "core-lib/components/radix/form/ImageUploadField";
import type {
  ProductCategoryDto,
  IngredientCategoryDto,
  UnitDto,
  ProductVariantTemplateDto,
  ProductAddOnTemplateDto,
} from "core-lib/api/commons/types";
import { ProductVariantsSection } from "../forms/ProductVariantsSection";
import { ProductAddOnGroupsSection } from "../forms/ProductAddOnGroupsSection";

interface VariantEntry {
  productVariantID: null;
  name: string;
  price: number | string;
  displayOrder: number | string;
}

interface AddOnItemEntry {
  productAddOnItemID: null;
  name: string;
  additionalPrice: number | string;
  displayOrder: number | string;
}

interface AddOnGroupEntry {
  productAddOnGroupID: null;
  name: string;
  isRequired: boolean;
  minSelections: number | string;
  maxSelections: number | string;
  displayOrder: number | string;
  items: AddOnItemEntry[];
}

export interface ProductEntry {
  isMenuItem: boolean;
  name: string;
  description: string;
  unitPrice: string;
  costPrice: string;
  purchaseQuantity: string;
  purchaseUnitID: string;
  stockUnitID: string;
  productCategoryID: string;
  ingredientCategoryID: string;
  variants: VariantEntry[];
  addOnGroups: AddOnGroupEntry[];
  imageFile: File | null;
}

export interface BulkProductForm {
  products: ProductEntry[];
}

interface BulkProductCardProps {
  index: number;
  control: Control<BulkProductForm>;
  watch: UseFormWatch<BulkProductForm>;
  setValue: UseFormSetValue<BulkProductForm>;
  remove: () => void;
  productCategories: ProductCategoryDto[];
  ingredientCategories: IngredientCategoryDto[];
  units: UnitDto[];
  variantTemplates: ProductVariantTemplateDto[];
  addOnTemplates: ProductAddOnTemplateDto[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any> | undefined;
}

export const BulkProductCard: React.FC<BulkProductCardProps> = ({
  index,
  control,
  watch,
  setValue,
  remove,
  productCategories,
  ingredientCategories,
  units,
  variantTemplates,
  addOnTemplates,
  errors,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);

  const isMenuItem = watch(`products.${index}.isMenuItem`);
  const productName = watch(`products.${index}.name`);
  const watchedVariants = useWatch({
    control,
    name: `products.${index}.variants`,
  });
  const hasVariantsDefined = (watchedVariants ?? []).length > 0;

  const rootCategoryOptions = React.useMemo(() => {
    if (isMenuItem) {
      return productCategories
        .filter((c) => !c.parentProductCategoryID)
        .map((c) => ({ value: c.productCategoryID, label: c.name }));
    }
    return ingredientCategories
      .filter((c) => !c.parentIngredientCategoryID)
      .map((c) => ({ value: c.ingredientCategoryID, label: c.name }));
  }, [isMenuItem, productCategories, ingredientCategories]);

  const subCategoryOptions = React.useMemo(() => {
    if (!selectedRootId) return [];
    if (isMenuItem) {
      return productCategories
        .filter((c) => c.parentProductCategoryID === selectedRootId)
        .map((c) => ({ value: c.productCategoryID, label: c.name }));
    }
    return ingredientCategories
      .filter((c) => c.parentIngredientCategoryID === selectedRootId)
      .map((c) => ({ value: c.ingredientCategoryID, label: c.name }));
  }, [isMenuItem, productCategories, ingredientCategories, selectedRootId]);

  const rootHasChildren = subCategoryOptions.length > 0;

  const handleRootChange = (rootId: string) => {
    const hasChildren = isMenuItem
      ? productCategories.some((c) => c.parentProductCategoryID === rootId)
      : ingredientCategories.some((c) => c.parentIngredientCategoryID === rootId);
    setSelectedRootId(rootId);
    if (isMenuItem) {
      setValue(
        `products.${index}.productCategoryID`,
        hasChildren ? "" : rootId,
      );
    } else {
      setValue(
        `products.${index}.ingredientCategoryID`,
        hasChildren ? "" : rootId,
      );
    }
  };

  const unitOptions = units.map((u) => ({
    label: u.name,
    value: u.unitID,
  }));

  return (
    <Card
      variant="surface"
      size="2"
      style={{ borderLeft: `3px solid ${isMenuItem ? "var(--indigo-8)" : "var(--green-8)"}` }}
    >
      {/* Card header */}
      <Flex align="center" justify="between" gap="3">
        <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
          <Badge color={isMenuItem ? "indigo" : "green"} size="1">
            {isMenuItem ? "Menu Item" : "Ingredient"}
          </Badge>
          <Text
            size="2"
            weight="medium"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: productName ? undefined : "var(--gray-10)",
            }}
          >
            {productName || "Untitled"}
          </Text>
        </Flex>
        <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
          <IconButton
            variant="ghost"
            size="1"
            color="gray"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </IconButton>
          <IconButton
            variant="ghost"
            size="1"
            color="red"
            aria-label="Remove product"
            onClick={remove}
          >
            <Cross1Icon />
          </IconButton>
        </Flex>
      </Flex>

      {expanded && (
        <Box mt="3">
          <Flex direction="column" gap="3">
            <TextField<BulkProductForm>
              name={`products.${index}.name`}
              control={control}
              label="Product Name"
              placeholder="Enter product name"
            />
            <TextField<BulkProductForm>
              name={`products.${index}.description`}
              control={control}
              label="Description"
              placeholder="Optional description"
              multiline
              rows={2}
            />

            {/* Product Image */}
            <ImageUploadField<BulkProductForm>
              name={`products.${index}.imageFile` as any}
              control={control}
              label="Product Image"
              description="Optional. Max 5 MB."
              accept="image/*"
              maxSizeBytes={5 * 1024 * 1024}
            />

            {/* Main Category */}
            <Flex direction="column" gap="1">
              <Text as="label" size="2" weight="medium">
                {isMenuItem ? "Main Category" : "Category"}
              </Text>
              <Select.Root
                value={selectedRootId ?? undefined}
                onValueChange={handleRootChange}
              >
                <Select.Trigger placeholder="Select main category…" />
                <Select.Content position="popper">
                  {rootCategoryOptions.length === 0 ? (
                    <Select.Item value="__empty" disabled>No categories</Select.Item>
                  ) : (
                    rootCategoryOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))
                  )}
                </Select.Content>
              </Select.Root>
            </Flex>

            {selectedRootId && rootHasChildren && (
              <SelectField<BulkProductForm>
                name={
                  isMenuItem
                    ? `products.${index}.productCategoryID`
                    : `products.${index}.ingredientCategoryID`
                }
                control={control}
                label="Sub-Category"
                options={subCategoryOptions}
                placeholder="Select sub-category…"
              />
            )}

            {/* Menu item fields */}
            {isMenuItem && (
              <>
                <Box>
                  <TextField<BulkProductForm>
                    name={`products.${index}.unitPrice`}
                    control={control}
                    label={hasVariantsDefined ? "Selling Price (Optional)" : "Selling Price"}
                    type="number"
                    placeholder="0.00"
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    {hasVariantsDefined
                      ? "Optional — POS will use the selected variant's price."
                      : "Price customers pay at the POS."}
                  </Text>
                </Box>

                <TextField<BulkProductForm>
                  name={`products.${index}.costPrice`}
                  control={control}
                  label="Material Cost (Optional)"
                  type="number"
                  placeholder="0.00"
                />
                <Text size="1" color="gray" as="div" mt="-2">
                  Internal cost for this menu item (not shown to customers).
                </Text>

                <Separator size="4" />

                <Box>
                  <Text size="2" weight="bold" mb="2" as="p">
                    Product Variants
                  </Text>
                  <ProductVariantsSection
                    control={control}
                    variantsFieldName={`products.${index}.variants`}
                    variantTemplates={variantTemplates}
                  />
                </Box>

                <Separator size="4" />

                <Box>
                  <Text size="2" weight="bold" mb="2" as="p">
                    Add-On Groups
                  </Text>
                  <ProductAddOnGroupsSection
                    control={control}
                    addOnGroupsFieldName={`products.${index}.addOnGroups`}
                    addOnTemplates={addOnTemplates}
                  />
                </Box>
              </>
            )}

            {/* Ingredient fields */}
            {!isMenuItem && (
              <>
                <TextField<BulkProductForm>
                  name={`products.${index}.costPrice`}
                  control={control}
                  label="Total Purchase Cost"
                  type="number"
                  placeholder="0.00"
                />

                <Flex gap="3" wrap="wrap">
                  <Box style={{ flex: "1 1 200px" }}>
                    <TextField<BulkProductForm>
                      name={`products.${index}.purchaseQuantity`}
                      control={control}
                      label="Purchase Quantity"
                      type="number"
                      placeholder="0"
                    />
                  </Box>
                  <Box style={{ flex: "1 1 200px" }}>
                    <SelectField<BulkProductForm>
                      name={`products.${index}.purchaseUnitID`}
                      control={control}
                      label="Purchase Unit"
                      options={unitOptions}
                      placeholder="Select unit..."
                    />
                  </Box>
                  <Box style={{ flex: "1 1 200px" }}>
                    <SelectField<BulkProductForm>
                      name={`products.${index}.stockUnitID`}
                      control={control}
                      label="Stock Unit"
                      options={unitOptions}
                      placeholder="Select unit..."
                    />
                  </Box>
                </Flex>
              </>
            )}
          </Flex>

          {errors && typeof errors === "object" && "name" in errors && errors.name?.message && (
            <Text size="1" color="red" mt="2" as="p">
              {String(errors.name.message)}
            </Text>
          )}
        </Box>
      )}
    </Card>
  );
};
