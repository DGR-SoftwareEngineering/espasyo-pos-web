import { useToastContext } from "core-lib";
import React, { useEffect, useState } from "react";
import { Box, Tabs } from "@radix-ui/themes";
import { UnitConversionForm } from "./UnitConversionForm";
import { UnitConversionForm as UnitConversionFormType } from "./validation";
import { useApiCallback, useApi } from "core-lib/core/hooks";
import {
  CreateUnitConversionParams,
  UnitDto,
} from "core-lib/api/commons/types";
import { UnitConversionListBlock } from "../list/UnitConversionListBlock";

export const UnitConversionFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const { showToast } = useToastContext();

  const unitData = useApi((api) => api.commons.unitList());
  const conversionCb = useApiCallback(
    async (api, args: CreateUnitConversionParams) =>
      await api.commons.createUnitConversion(args),
  );

  useEffect(() => {
    setUnits(unitData.result?.data.response ?? []);
  }, [unitData.result?.data.response]);

  async function handleSubmit(formData: UnitConversionFormType) {
    try {
      setLoading(true);

      const payload: CreateUnitConversionParams = {
        fromUnitID: formData.fromUnitID,
        toUnitID: formData.toUnitID,
        conversionRate: formData.conversionRate,
        isApproximate: formData.isApproximate || false,
        notes: formData.notes || "",
      };

      const result = await conversionCb.execute(payload);

      if (result.status === 201 && result.data.success) {
        showToast("Unit conversion created successfully", "success");
        setResetForm(true);
        setTimeout(() => setResetForm(false), 100);
      } else {
        showToast(
          result.data.message || "Failed to create unit conversion",
          "error",
        );
      }
    } catch (error) {
      console.error("Error creating unit conversion:", error);
      showToast("Failed to create unit conversion", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Tabs.Root defaultValue="create">
      <Tabs.List size="2">
        <Tabs.Trigger value="create">Create Conversion</Tabs.Trigger>
        <Tabs.Trigger value="list">Conversions</Tabs.Trigger>
      </Tabs.List>

      <Box pt="4">
        <Tabs.Content value="create">
          <UnitConversionForm
            submitLoading={loading || unitData.loading}
            resetForm={resetForm}
            onSubmit={handleSubmit}
            isInDialog={false}
            units={units}
          />
        </Tabs.Content>

        <Tabs.Content value="list">
          <UnitConversionListBlock />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
};
