import React, { useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  IconButton,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  AddCircleOutlined,
  AutoGraphOutlined,
  CalendarTodayOutlined,
  CategoryOutlined,
  DeleteOutlined,
  InfoOutlined,
  LocalOfferOutlined,
  MonetizationOnOutlined,
  ShoppingCartOutlined,
  TitleOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useFieldArray, Controller } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { ImageUploadField } from "core-lib/components/radix/form/ImageUploadField";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { formatCurrency } from "core-lib/business/strings";
import { usePromoForm } from "../hooks";
import { TYPE_CONFIG, SUBMISSION_KEYS } from "../constants";
import { PromoFormProps } from "./types";
import { CustomerTargetingSection } from "./CustomerTargetingSection";

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  imageFile: "Image",
  type: "Promo Type",
  discountPercent: "Discount Percentage",
  discountAmount: "Discount Amount",
  buyQuantity: "Buy Quantity",
  getQuantity: "Get Quantity",
  bundlePrice: "Bundle Price",
  startDate: "Start Date",
  endDate: "End Date",
  reason: "Reason",
  items: "Products",
};

const PROMO_TYPE_OPTIONS = [
  { value: "1", label: "% Discount — Reduce price by a percentage" },
  { value: "2", label: "Fixed Discount — Subtract a flat amount" },
  { value: "3", label: "Buy X Get Y — Buy X, get Y free" },
  { value: "4", label: "Bundle — Fixed price for a group" },
];

const MetricRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}> = ({ label, value, valueColor, bold }) => (
  <Flex justify="between" align="center" py="1">
    <Text size="2" color="gray">{label}</Text>
    <Text size="2" weight={bold ? "bold" : "medium"} style={{ color: valueColor }}>
      {value}
    </Text>
  </Flex>
);

type MarginLevel = { label: string; color: "green" | "teal" | "blue" | "orange" | "red"; cssColor: string };

const getMarginLevel = (pct: number): MarginLevel => {
  if (pct >= 30) return { label: "Excellent", color: "green",  cssColor: "var(--green-11)" };
  if (pct >= 20) return { label: "Good",      color: "teal",   cssColor: "var(--teal-11)" };
  if (pct >= 10) return { label: "Acceptable",color: "blue",   cssColor: "var(--blue-11)" };
  if (pct >= 5)  return { label: "Low",        color: "orange", cssColor: "var(--orange-11)" };
  return           { label: "At Risk",          color: "red",   cssColor: "var(--red-11)" };
};

export const PromoForm: React.FC<PromoFormProps> = ({
  onSubmit,
  submitLoading,
  isInDialog,
  initialValues,
  products,
  productCategories,
  calcResult,
  onCalculate,
  calcLoading,
  onValuesChange,
  variantsByProductId = {},
  onLoadVariants,
  variantsLoading = {},
  allVariantsLoaded = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    isDirty,
    watchedValues,
    getValues,
    setValue,
  } = usePromoForm({ onSubmit, initialValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const promoType = watchedValues.promoType;

  const canCalculate = (() => {
    const hasProducts =
      watchedValues.items.length > 0 &&
      watchedValues.items.some(
        (i) => !!i.productID || !!i.productCategoryID || !!i.productVariantID,
      );
    const hasDiscountField =
      (promoType === 1 && !!watchedValues.discountPercent) ||
      (promoType === 2 && !!watchedValues.discountAmount) ||
      (promoType === 3 && !!watchedValues.buyQuantity && !!watchedValues.getQuantity) ||
      (promoType === 4 && !!watchedValues.bundlePrice);
    return hasProducts && hasDiscountField;
  })();

  useEffect(() => {
    onValuesChange?.(getValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.promoType,
    watchedValues.discountPercent,
    watchedValues.discountAmount,
    watchedValues.buyQuantity,
    watchedValues.getQuantity,
    watchedValues.bundlePrice,
    watchedValues.items,
  ]);

  const productOptions = products.map((p) => ({
    value: p.productID,
    label: p.name,
  }));

  const variantProductOptions = allVariantsLoaded
    ? products
        .filter((p) => (variantsByProductId[p.productID] ?? []).length > 0)
        .map((p) => ({ value: p.productID, label: p.name }))
    : [];

  const categoryOptions = productCategories.map((c) => ({
    value: c.productCategoryID,
    label: c.parentProductCategoryName
      ? `${c.parentProductCategoryName} › ${c.name}`
      : c.name,
  }));

  const handleAddItem = () => {
    append({
      targetMode: "product",
      productID: "",
      productCategoryID: null,
      productVariantID: null,
      variantProductID: null,
      quantity: 1,
      isFreeItem: false,
    });
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return (
    <Box>
      <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

      {/* Promo Type */}
      <FormSection
        icon={<LocalOfferOutlined style={{ color: "var(--accent-11)" }} />}
        title="Promo Type"
        description="Choose the type of promotion you want to create."
      >
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([1, 2, 3, 4] as const).map((typeNum) => {
            const config = TYPE_CONFIG[typeNum];
            const isSelected = promoType === typeNum;
            return (
              <Controller
                key={typeNum}
                name="type"
                control={control}
                render={({ field }) => (
                  <Card
                    variant="surface"
                    style={{
                      cursor: "pointer",
                      border: isSelected
                        ? "2px solid var(--accent-9)"
                        : "2px solid transparent",
                      background: isSelected ? "var(--accent-a3)" : undefined,
                      transition: "all 0.15s",
                    }}
                    onClick={() => field.onChange(typeNum)}
                  >
                    <Flex direction="column" gap="1" p="1">
                      <Text size="2" weight="bold">
                        {config.shortLabel}
                      </Text>
                      <Text size="1" color="gray">
                        {config.description}
                      </Text>
                    </Flex>
                  </Card>
                )}
              />
            );
          })}
        </Box>
      </FormSection>

      {/* Discount Details — conditional per type */}
      <Box mt="4">
        <FormSection
          icon={<MonetizationOnOutlined style={{ color: "var(--green-11)" }} />}
          title="Discount Details"
          description={
            promoType === 1
              ? "Set the percentage to discount off the original price."
              : promoType === 2
              ? "Set the fixed amount to subtract from the original price."
              : promoType === 3
              ? "Set how many the customer must buy and how many they get free."
              : "Set the fixed bundle price for all included products."
          }
        >
          {promoType === 1 && (
            <TextField
              name="discountPercent"
              control={control}
              label="Discount Percentage (%)"
              placeholder="e.g. 10"
              type="number"
            />
          )}
          {promoType === 2 && (
            <TextField
              name="discountAmount"
              control={control}
              label="Discount Amount"
              placeholder="e.g. 50"
              type="number"
            />
          )}
          {promoType === 3 && (
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <TextField
                  name="buyQuantity"
                  control={control}
                  label="Buy Quantity"
                  placeholder="e.g. 2"
                  type="number"
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <TextField
                  name="getQuantity"
                  control={control}
                  label="Get Quantity (Free)"
                  placeholder="e.g. 1"
                  type="number"
                />
              </Box>
            </Flex>
          )}
          {promoType === 4 && (
            <TextField
              name="bundlePrice"
              control={control}
              label="Bundle Price"
              placeholder="e.g. 299"
              type="number"
            />
          )}
        </FormSection>
      </Box>

      {/* Products */}
      <Box mt="4">
        <FormSection
          icon={<ShoppingCartOutlined style={{ color: "var(--blue-11)" }} />}
          title="Products"
          description="Select the products included in this promotion."
        >
          <Flex direction="column" gap="2">
            {fields.length === 0 && (
              <Card variant="surface" style={{ background: "var(--gray-a2)" }}>
                <Flex align="center" justify="center" py="3">
                  <Text size="2" color="gray">No products added yet.</Text>
                </Flex>
              </Card>
            )}
            {fields.map((field, index) => (
              <Card key={field.id} variant="surface" style={{ background: "var(--gray-a2)" }}>
                <Flex direction="column" gap="2">
                  {/* Per-item target mode toggle */}
                  <Controller
                    name={`items.${index}.targetMode`}
                    control={control}
                    render={({ field: modeField }) => (
                      <Flex gap="1" align="center" wrap="wrap">
                        <TargetModeChip
                          active={modeField.value === "product"}
                          label="Specific Product"
                          onClick={() => {
                            modeField.onChange("product");
                            setValue(`items.${index}.productCategoryID` as const, null);
                            setValue(`items.${index}.productVariantID` as const, null);
                            setValue(`items.${index}.variantProductID` as const, null);
                          }}
                        />
                        <TargetModeChip
                          active={modeField.value === "category"}
                          label="Whole Category"
                          onClick={() => {
                            modeField.onChange("category");
                            setValue(`items.${index}.productID` as const, "");
                            setValue(`items.${index}.productVariantID` as const, null);
                            setValue(`items.${index}.variantProductID` as const, null);
                          }}
                        />
                        <TargetModeChip
                          active={modeField.value === "variant"}
                          label="Specific Variant"
                          color="violet"
                          onClick={() => {
                            modeField.onChange("variant");
                            setValue(`items.${index}.productID` as const, "");
                            setValue(`items.${index}.productCategoryID` as const, null);
                            setValue(`items.${index}.productVariantID` as const, null);
                          }}
                        />
                      </Flex>
                    )}
                  />

                  <Flex gap="2" align="end">
                    <Box style={{ flex: 1 }}>
                      {(watchedValues.items?.[index]?.targetMode ?? "product") === "variant" ? (
                        /* ── Variant targeting: two-step selection ── */
                        <Flex direction="column" gap="2">
                          {!allVariantsLoaded ? (
                            <Box>
                              <Text size="1" color="gray" style={{ display: "block", marginBottom: 4 }}>
                                Product
                              </Text>
                              <Skeleton height="36px" />
                            </Box>
                          ) : variantProductOptions.length === 0 ? (
                            <Callout.Root color="gray" size="1">
                              <Callout.Icon>
                                <InfoOutlined style={{ fontSize: 14 }} />
                              </Callout.Icon>
                              <Callout.Text size="1">
                                No products with variants found. Add variants to products first.
                              </Callout.Text>
                            </Callout.Root>
                          ) : (
                            <SelectField
                              name={`items.${index}.variantProductID`}
                              control={control}
                              label="Product"
                              options={variantProductOptions}
                              placeholder="Select product to browse variants…"
                              onSelectOption={(option) => {
                                if (option.value) onLoadVariants?.(option.value);
                                setValue(`items.${index}.productVariantID` as const, null);
                              }}
                            />
                          )}
                          {watchedValues.items?.[index]?.variantProductID && (() => {
                            const pid = watchedValues.items[index].variantProductID!;
                            const variantList = variantsByProductId[pid] ?? [];
                            const isLoadingVariants = variantsLoading[pid];
                            const selectedVariantId = watchedValues.items[index].productVariantID;
                            const selectedVariant = variantList.find(
                              (v) => v.productVariantID === selectedVariantId,
                            );
                            return (
                              <>
                                {isLoadingVariants ? (
                                  <Skeleton height="36px" />
                                ) : variantList.length === 0 ? (
                                  <Callout.Root color="amber" size="1">
                                    <Callout.Icon>
                                      <InfoOutlined style={{ fontSize: 14 }} />
                                    </Callout.Icon>
                                    <Callout.Text size="1">
                                      No active variants found for this product.
                                    </Callout.Text>
                                  </Callout.Root>
                                ) : (
                                  <SelectField
                                    name={`items.${index}.productVariantID`}
                                    control={control}
                                    label="Variant"
                                    options={variantList.map((v) => ({
                                      value: v.productVariantID,
                                      label: `${v.name} — ₱${v.price.toFixed(2)}`,
                                    }))}
                                    placeholder="Select variant…"
                                  />
                                )}
                                {selectedVariant && (
                                  <Card
                                    variant="surface"
                                    style={{
                                      background: "var(--violet-a2)",
                                      border: "1px solid var(--violet-a5)",
                                      padding: "8px 12px",
                                    }}
                                  >
                                    <Flex align="center" justify="between">
                                      <Flex align="center" gap="2">
                                        <CategoryOutlined
                                          style={{ fontSize: 14, color: "var(--violet-11)" }}
                                        />
                                        <Text size="2" weight="medium">
                                          {selectedVariant.name}
                                        </Text>
                                      </Flex>
                                      <Badge color="violet" variant="soft" size="2">
                                        ₱{selectedVariant.price.toFixed(2)}
                                      </Badge>
                                    </Flex>
                                  </Card>
                                )}
                              </>
                            );
                          })()}
                        </Flex>
                      ) : (watchedValues.items?.[index]?.targetMode ?? "product") === "category" ? (
                        <SelectField
                          name={`items.${index}.productCategoryID`}
                          control={control}
                          label="Category"
                          options={categoryOptions}
                          placeholder="Select category…"
                        />
                      ) : (
                        <SelectField
                          name={`items.${index}.productID`}
                          control={control}
                          label="Product"
                          options={productOptions}
                          placeholder="Select product…"
                        />
                      )}
                    </Box>
                    <Box style={{ width: 80 }}>
                      <TextField
                        name={`items.${index}.quantity`}
                        control={control}
                        label="Qty"
                        type="number"
                        placeholder="1"
                      />
                    </Box>
                    {promoType === 3 && (
                      <Box style={{ minWidth: 80 }}>
                        <Controller
                          name={`items.${index}.isFreeItem`}
                          control={control}
                          render={({ field: f }) => (
                            <Flex direction="column" gap="1">
                              <Text size="1" color="gray">Free Item</Text>
                              <Button
                                type="button"
                                variant={f.value ? "solid" : "outline"}
                                color={f.value ? "green" : "gray"}
                                size="2"
                                onClick={() => f.onChange(!f.value)}
                              >
                                {f.value ? "Free" : "Paid"}
                              </Button>
                            </Flex>
                          )}
                        />
                      </Box>
                    )}
                    <IconButton
                      type="button"
                      variant="ghost"
                      color="red"
                      size="2"
                      onClick={() => remove(index)}
                      style={{ marginBottom: 2 }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Flex>
                </Flex>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              color="gray"
              size="2"
              onClick={handleAddItem}
            >
              <AddCircleOutlined fontSize="small" />
              Add Product
            </Button>
          </Flex>
        </FormSection>
      </Box>

      {/* Schedule */}
      <Box mt="4">
        <FormSection
          icon={<CalendarTodayOutlined style={{ color: "var(--orange-11)" }} />}
          title="Schedule"
          description="Optionally set a start and end date for this promotion."
        >
          <Flex gap="3">
            <Box style={{ flex: 1 }}>
              <TextField
                name="startDate"
                control={control}
                label="Start Date"
                type="datetime-local"
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <TextField
                name="endDate"
                control={control}
                label="End Date"
                type="datetime-local"
              />
            </Box>
          </Flex>
        </FormSection>
      </Box>

      <CustomerTargetingSection control={control} />

      {/* Details */}
      <Box mt="4">
        <FormSection
          icon={<TitleOutlined style={{ color: "var(--indigo-11)" }} />}
          title="Details"
          description="Provide a title and optional description for this promo."
        >
          <TextField
            name="title"
            control={control}
            label="Promo Title"
            placeholder="e.g. Summer Special"
          />
          <Box mt="2">
            <TextField
              name="description"
              control={control}
              label="Description"
              placeholder="Optional — describe the promotion to customers"
              multiline
              rows={2}
            />
          </Box>
          <Box mt="2">
            <TextField
              name="reason"
              control={control}
              label="Internal Reason"
              placeholder="Optional — why this promo was created"
            />
          </Box>
          <Box mt="2">
            <ImageUploadField
              name="imageFile"
              control={control}
              label="Promo Image"
              accept="image/*"
              maxSizeBytes={5 * 1024 * 1024}
            />
          </Box>
        </FormSection>
      </Box>

      {/* Cost Preview */}
      <Box mt="4">
        <FormSection
          icon={<TrendingUpOutlined style={{ color: "var(--purple-11)" }} />}
          title="Cost Preview"
          description="Check financial viability before activating this promo."
        >
          <Flex gap="2" direction="column">
            <Button
              type="button"
              variant="outline"
              color="indigo"
              size="2"
              onClick={() => onCalculate?.(getValues())}
              loading={!!calcLoading}
              disabled={!canCalculate || !onCalculate}
            >
              <AutoGraphOutlined fontSize="small" />
              Preview Cost Impact
            </Button>

            {calcResult && (() => {
              const discountAmt = calcResult.originalPrice - calcResult.finalPrice;
              const discountPct = calcResult.originalPrice > 0
                ? (discountAmt / calcResult.originalPrice) * 100
                : 0;
              const marginLevel = getMarginLevel(calcResult.marginPercent);
              const noCostData = !calcResult.hasCostData;
              const barWidth = Math.min(Math.max(calcResult.marginPercent, 0), 100);

              return (
                <Card variant="surface" style={{ border: "1px solid var(--purple-a5)", background: "var(--color-background)" }}>
                  {/* Header */}
                  <Flex align="center" gap="2" mb="3">
                    <AutoGraphOutlined style={{ fontSize: 18, color: "var(--purple-11)" }} />
                    <Text size="3" weight="bold">Financial Impact</Text>
                    <Badge
                      color={calcResult.isViable ? "green" : "red"}
                      variant="solid"
                      size="1"
                      ml="auto"
                    >
                      {calcResult.isViable ? "Viable" : "Not Viable"}
                    </Badge>
                  </Flex>

                  {/* COGS warning */}
                  {noCostData && (
                    <Callout.Root color="amber" variant="soft" size="1" mb="3">
                      <Callout.Icon>
                        <WarningAmberOutlined fontSize="small" />
                      </Callout.Icon>
                      <Callout.Text>
                        No cost data found for this product. Set a cost price in Product Management to see profitability.
                      </Callout.Text>
                    </Callout.Root>
                  )}

                  {/* Price Breakdown */}
                  <Text size="1" color="gray" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Price Breakdown
                  </Text>
                  <Box mt="1" mb="3">
                    <MetricRow
                      label="Original Price"
                      value={formatCurrency(calcResult.originalPrice)}
                    />
                    <MetricRow
                      label="Customer Savings"
                      value={`-${formatCurrency(discountAmt)} (${discountPct.toFixed(1)}% off)`}
                      valueColor="var(--orange-11)"
                    />
                    <Flex justify="between" align="center" py="1"
                      style={{ borderTop: "1px solid var(--gray-a4)", marginTop: 4, paddingTop: 8 }}
                    >
                      <Text size="2" weight="bold">Promo Price</Text>
                      <Text size="3" weight="bold" style={{ color: "var(--blue-11)" }}>
                        {formatCurrency(calcResult.finalPrice)}
                      </Text>
                    </Flex>
                  </Box>

                  {!noCostData && <Separator size="4" />}

                  {/* Profitability — hidden when no cost data */}
                  {!noCostData && (
                    <Box mt="3">
                      <Text size="1" color="gray" weight="bold" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Profitability
                      </Text>
                      <Box mt="1">
                        <MetricRow
                          label="Cost of Goods (COGS)"
                          value={formatCurrency(calcResult.totalCost)}
                        />
                        <MetricRow
                          label="Revenue at Promo Price"
                          value={formatCurrency(calcResult.finalPrice)}
                          valueColor="var(--blue-11)"
                        />
                        <Flex justify="between" align="center" py="1"
                          style={{ borderTop: "1px solid var(--gray-a4)", marginTop: 4, paddingTop: 8 }}
                        >
                          <Text size="2" weight="bold">Estimated Profit</Text>
                          <Text size="2" weight="bold" style={{ color: calcResult.profit >= 0 ? "var(--green-11)" : "var(--red-11)" }}>
                            {formatCurrency(calcResult.profit)}
                          </Text>
                        </Flex>
                      </Box>
                    </Box>
                  )}

                  {!noCostData && <Separator size="4" mt="3" />}

                  {/* Margin with bar — hidden when no cost data */}
                  {!noCostData && (
                    <Box mt="3">
                      <Flex justify="between" align="center" mb="1">
                        <Text size="2" weight="bold">Gross Margin</Text>
                        <Flex align="center" gap="2">
                          <Text size="2" weight="bold" style={{ color: marginLevel.cssColor }}>
                            {calcResult.marginPercent.toFixed(1)}%
                          </Text>
                          <Badge color={marginLevel.color} variant="soft" size="1">
                            {marginLevel.label}
                          </Badge>
                        </Flex>
                      </Flex>
                      <Box style={{ background: "var(--gray-a3)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                        <Box style={{
                          width: `${barWidth}%`,
                          height: "100%",
                          background: marginLevel.cssColor,
                          borderRadius: 6,
                          transition: "width 0.4s ease",
                        }} />
                      </Box>
                      <Flex justify="between" mt="1">
                        <Text size="1" color="gray">0%</Text>
                        <Text size="1" color="gray">At Risk &lt;5%</Text>
                        <Text size="1" color="gray">Good ≥20%</Text>
                        <Text size="1" color="gray">100%</Text>
                      </Flex>
                    </Box>
                  )}
                </Card>
              );
            })()}
          </Flex>
        </FormSection>
      </Box>

      <Box mt="4">
        <FormActions
          isEdit={false}
          isValid={isValid}
          isDirty={isDirty}
          submitLoading={submitLoading}
          isInDialog={!!isInDialog}
          submissionKey={SUBMISSION_KEYS.create}
          onButtonClick={() => handleFormSubmit()}
          buttonText="Create Promo"
        />
      </Box>
    </Box>
  );
};

/** Small pill button used for the per-item Product / Category target toggle. */
const TargetModeChip: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
  color?: "violet";
}> = ({ active, label, onClick, color }) => {
  const activeColor = color ?? "accent";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        border: active
          ? `1px solid var(--${activeColor}-9)`
          : "1px solid var(--gray-a5)",
        background: active ? `var(--${activeColor}-a3)` : "var(--color-panel-solid)",
        color: active ? `var(--${activeColor}-12)` : "var(--gray-11)",
        transition: "all 0.12s ease",
      }}
    >
      {label}
    </button>
  );
};
