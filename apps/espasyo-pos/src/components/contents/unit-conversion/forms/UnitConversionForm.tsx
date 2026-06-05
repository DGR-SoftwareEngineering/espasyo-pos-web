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
  SwapHorizOutlined,
  InfoOutlined,
  ScaleOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
  NotesOutlined,
  HelpOutlineOutlined,
} from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { SelectField } from "core-lib/components/radix/form/SelectField";
import { ToggleField } from "core-lib/components/radix/toggle/ToggleField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { toSelectOptionsWithField } from "core-lib/business/array";
import { useUnitConversionForm } from "../hooks/useUnitConversionForm";
import { UnitConversionFormProps } from "./types";
import { APPROXIMATE_OPTIONS } from "../constants";

export const UnitConversionForm: React.FC<UnitConversionFormProps> = ({
  onSubmit,
  submitLoading,
  resetForm,
  initialValues,
  isEdit = false,
  isInDialog = false,
  units,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    watchedValues,
    isDirty,
    submissionKey,
  } = useUnitConversionForm({
    initialValues,
    resetForm,
    isEdit,
    isInDialog,
    onSubmit,
  });

  const unitOptions = React.useMemo(
    () => toSelectOptionsWithField(units ?? [], "unitID", "name"),
    [units],
  );

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    handleFormSubmit();
  };

  const fromUnit = units?.find((u) => u.unitID === watchedValues.fromUnitID);
  const toUnit = units?.find((u) => u.unitID === watchedValues.toUnitID);
  const conversionRate = watchedValues.conversionRate;
  const isApproximate = watchedValues.isApproximate;

  const showPreview =
    !!fromUnit?.name && !!toUnit?.name && !!conversionRate && conversionRate > 0;

  const isSameUnit =
    !!watchedValues.fromUnitID &&
    watchedValues.fromUnitID === watchedValues.toUnitID;

  return (
    <Card variant="surface" size="3" style={{ width: "100%" }}>
      <FormHeader
        isEdit={isEdit}
        title="Unit Conversion"
        editTitle="Edit Unit Conversion"
        subtitle="Define how different units relate to each other"
        editSubtitle="Update conversion rate between units"
        icon={SwapHorizOutlined}
      />

      {showPreview && (
        <Box
          mx="4"
          mt="3"
          p="3"
          style={{
            background: "var(--green-a3)",
            border: "1px solid var(--green-a5)",
            borderRadius: "var(--radius-3)",
          }}
        >
          <Flex align="center" justify="center" gap="3" wrap="wrap">
            <Text size="3" weight="medium">
              1 {fromUnit.name}
            </Text>
            <Heading size="5" style={{ color: "var(--green-11)" }}>
              =
            </Heading>
            <Heading size="5" weight="bold" style={{ color: "var(--green-11)" }}>
              {conversionRate}
            </Heading>
            <Text size="3" weight="medium">
              {toUnit.name}
            </Text>
            {isApproximate && (
              <Badge color="amber" variant="soft" radius="full">
                Approximate
              </Badge>
            )}
          </Flex>
        </Box>
      )}

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormSection
            icon={<ScaleOutlined style={{ color: "var(--accent-11)" }} />}
            title="1. Select Units to Convert"
            description="Choose the units you want to create a conversion for."
          >
            <Flex direction="column" gap="3">
              <Box
                p="3"
                style={{
                  background: "var(--blue-a3)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Flex align="center" gap="1" mb="1">
                  <HelpOutlineOutlined
                    style={{ fontSize: 14, color: "var(--blue-11)" }}
                  />
                  <Text size="1" weight="medium" style={{ color: "var(--blue-11)" }}>
                    Example:
                  </Text>
                  <Text size="1" color="gray">
                    If you buy chicken wings by <strong>kg</strong> but use{" "}
                    <strong>pieces</strong> in recipes, select:
                  </Text>
                </Flex>
                <Text size="1" color="gray" as="div">
                  • From Unit: <strong>kg</strong> (how you buy)
                </Text>
                <Text size="1" color="gray" as="div">
                  • To Unit: <strong>pcs</strong> (how you use)
                </Text>
              </Box>

              <Grid columns={{ initial: "1", md: "2" }} gap="3">
                <Box>
                  <SelectField
                    name="fromUnitID"
                    control={control}
                    options={unitOptions}
                    label="From Unit"
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    The unit you purchase or have
                  </Text>
                </Box>
                <Box>
                  <SelectField
                    name="toUnitID"
                    control={control}
                    options={unitOptions}
                    label="To Unit"
                  />
                  <Text size="1" color="gray" as="div" mt="1">
                    The unit you use in recipes or inventory
                  </Text>
                </Box>
              </Grid>

              {isSameUnit && (
                <Callout.Root color="amber" variant="soft">
                  <Callout.Icon>
                    <WarningAmberOutlined style={{ fontSize: 18 }} />
                  </Callout.Icon>
                  <Callout.Text>
                    Cannot create conversion from a unit to itself. Please
                    select different units.
                  </Callout.Text>
                </Callout.Root>
              )}
            </Flex>
          </FormSection>

          <FormSection
            icon={<TrendingUpOutlined style={{ color: "var(--green-11)" }} />}
            title="2. Set the Conversion Rate"
            description={'Define how many "To Units" equal one "From Unit".'}
          >
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              <Box>
                <TextField
                  name="conversionRate"
                  control={control}
                  label="Conversion Rate"
                  type="number"
                  placeholder="8"
                />
                <Text size="1" color="gray" as="div" mt="1">
                  1 {fromUnit?.name || "unit"} = ? {toUnit?.name || "unit"}
                </Text>
              </Box>
              <Box
                p="3"
                style={{
                  background: "var(--blue-a3)",
                  border: "1px solid var(--blue-a5)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Text size="2" weight="medium" as="div" mb="1">
                  Quick Reference
                </Text>
                <Text size="1" color="gray" as="div">
                  • <strong>kg → g:</strong> 1000
                </Text>
                <Text size="1" color="gray" as="div">
                  • <strong>kg → pcs:</strong> varies (e.g., 8 for chicken
                  wings)
                </Text>
                <Text size="1" color="gray" as="div">
                  • <strong>liter → ml:</strong> 1000
                </Text>
                <Text size="1" color="gray" as="div">
                  • <strong>kg → lb:</strong> 2.20462
                </Text>
              </Box>
            </Grid>
          </FormSection>

          <FormSection
            icon={<WarningAmberOutlined style={{ color: "var(--amber-11)" }} />}
            title="3. Specify Accuracy"
            description="Mark if this conversion is approximate or exact."
          >
            <Flex direction="column" gap="3">
              <Box
                p="3"
                style={{
                  background: "var(--amber-a3)",
                  borderRadius: "var(--radius-3)",
                }}
              >
                <Flex align="center" gap="1" mb="1">
                  <HelpOutlineOutlined
                    style={{ fontSize: 14, color: "var(--amber-11)" }}
                  />
                  <Text size="1" weight="medium" style={{ color: "var(--amber-11)" }}>
                    When to mark as "Approximate":
                  </Text>
                </Flex>
                <Text size="1" color="gray" as="div">
                  • Weight to pieces (e.g., 1 kg = 8 pieces, but pieces may vary
                  in size)
                </Text>
                <Text size="1" color="gray" as="div">
                  • When the conversion depends on item size or type
                </Text>
                <Text size="1" as="div" mt="2" style={{ color: "var(--green-11)" }}>
                  <strong>Mark as "Exact" for:</strong> kg → g, liter → ml, etc.
                </Text>
              </Box>
              <ToggleField
                control={control}
                name="isApproximate"
                options={APPROXIMATE_OPTIONS}
              />
            </Flex>
          </FormSection>

          <FormSection
            icon={<NotesOutlined style={{ color: "var(--purple-11)" }} />}
            title="4. Additional Notes (Optional)"
            description="Add any notes or comments about this conversion for future reference"
          >
            <TextField
              name="notes"
              control={control}
              label="Notes"
              placeholder="e.g., 1 kg of chicken wings = approximately 8 pieces (varies by size)"
              multiline
              rows={3}
            />
            {errors.notes && (
              <Text size="1" color="red" as="div" mt="1">
                {errors.notes.message}
              </Text>
            )}
          </FormSection>

          <Callout.Root color="blue" variant="soft">
            <Callout.Icon>
              <InfoOutlined style={{ fontSize: 18 }} />
            </Callout.Icon>
            <Callout.Text>
              <strong>How Unit Conversions Work</strong>
              <br />• When you create a product, you'll specify:
              <br />
              &nbsp;&nbsp;- <strong>Purchase Unit:</strong> How you buy (e.g.,
              kg)
              <br />
              &nbsp;&nbsp;- <strong>Stock Unit:</strong> How you track (e.g.,
              pcs)
              <br />• The system will automatically use this conversion to
              calculate costs
              <br />• Example: 15 kg @ ₱2,300 = ₱153.33/kg → ÷ 8 = ₱19.17/piece →
              × 4 pieces = ₱76.67
            </Callout.Text>
          </Callout.Root>
        </Flex>
      </Box>

      <FormActions
        isEdit={isEdit}
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        onButtonClick={handleButtonClick}
        isInDialog={isInDialog}
        buttonText={isEdit ? "Update Conversion" : "Create Conversion"}
        submissionKey={submissionKey}
      />
    </Card>
  );
};
