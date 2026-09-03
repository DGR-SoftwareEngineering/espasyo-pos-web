import React from "react";
import {
  Box,
  Flex,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Card,
  Grid,
} from "@radix-ui/themes";;
import { TuneOutlined, InfoOutlined } from "@mui/icons-material";
import { TextField } from "core-lib/components/radix/form/TextField";
import { FormHeader } from "core-lib/components/radix/FormHeader";
import { FormSection } from "core-lib/components/radix/FormSection";
import { FormActions } from "core-lib/components/radix/FormActions";
import { FormErrorSummary } from "core-lib/components/radix/FormErrorSummary";
import { formatNumber } from "core-lib/business/number";
import { useThresholdsForm } from "../hooks";
import { PLACEHOLDERS } from "../constants";
import { ThresholdsFormProps } from "./types";

const FIELD_LABELS: Record<string, string> = {
  reorderLevel: "Reorder Level",
  minimumStockLevel: "Minimum Stock Level",
};

export const ThresholdsForm: React.FC<ThresholdsFormProps> = ({
  inventory,
  onSubmit,
  submitLoading,
  resetForm,
  isInDialog,
}) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
    isDirty,
    submissionKey,
  } = useThresholdsForm({
    initialValues: {
      reorderLevel: inventory.reorderLevel,
      minimumStockLevel: inventory.minimumStockLevel,
    },
    resetForm,
    isInDialog,
    onSubmit,
  });

  const unitLabel = inventory.stockUnitName ?? "units";

  const handleFormSubmit = handleSubmit(onSubmit);
  const handleButtonClick = () => {
    handleFormSubmit();
  };

  const Shell: React.ElementType = isInDialog ? Box : Card;
  const shellProps = isInDialog
    ? { style: { width: "100%" } }
    : { variant: "surface" as const, size: "3" as const, style: { width: "100%" } };

  return (
    <Shell {...shellProps}>
      <FormHeader
        isEdit
        title="Edit Thresholds"
        editTitle="Edit Thresholds"
        subtitle={inventory.productName ?? "Inventory thresholds"}
        editSubtitle={inventory.productName ?? "Inventory thresholds"}
        icon={TuneOutlined}
      />

      <Box
        px="4"
        py="3"
        style={{
          background: "var(--blue-a3)",
          borderBottom: "1px solid var(--blue-a5)",
        }}
      >
        <Flex align="center" gap="2">
          <InfoOutlined
            style={{ fontSize: 18, color: "var(--blue-11)" }}
          />
          <Text size="2" color="gray">
            Current stock is{" "}
            <Text weight="bold" color="gray">
              {formatNumber(inventory.currentQuantity)} {unitLabel}
            </Text>{" "}
            — use <em>Adjust Stock</em> if you need to change it.
          </Text>
        </Flex>
      </Box>

      <Box p="4">
        <Flex direction="column" gap="4">
          <FormErrorSummary errors={errors} fieldLabels={FIELD_LABELS} />

          <FormSection
            icon={<TuneOutlined style={{ color: "var(--blue-11)" }} />}
            title="Threshold Levels"
            description="Reorder level must be at or above the minimum stock level."
          >
            <Grid columns={{ initial: "1", md: "2" }} gap="3">
              <Box>
                <TextField
                  name="reorderLevel"
                  control={control}
                  label="Reorder Level"
                  type="number"
                  placeholder={PLACEHOLDERS.reorderLevel}
                  endAdornment={
                    <Text size="2" color="gray">
                      {unitLabel}
                    </Text>
                  }
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Triggers Low Stock when quantity drops to this level.
                </Text>
              </Box>
              <Box>
                <TextField
                  name="minimumStockLevel"
                  control={control}
                  label="Minimum Stock Level"
                  type="number"
                  placeholder={PLACEHOLDERS.minimumStockLevel}
                  endAdornment={
                    <Text size="2" color="gray">
                      {unitLabel}
                    </Text>
                  }
                />
                <Text size="1" color="gray" as="div" mt="1">
                  Triggers Critical when quantity drops to this level.
                </Text>
              </Box>
            </Grid>
          </FormSection>
        </Flex>
      </Box>

      <FormActions
        isEdit
        isValid={isValid}
        isDirty={isDirty}
        submitLoading={submitLoading}
        isInDialog={isInDialog}
        submissionKey={submissionKey}
        onButtonClick={handleButtonClick}
        buttonText="Update Thresholds"
      />
    </Shell>
  );
};
