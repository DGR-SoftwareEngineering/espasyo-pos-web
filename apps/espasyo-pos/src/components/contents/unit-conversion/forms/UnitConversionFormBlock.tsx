import { useToastContext } from "core-lib";
import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@radix-ui/themes";
import {
  TabsContextProvider,
  TabsHeaderDesktop,
  TabsHeaderMobile,
  TabPanel,
  TabOption,
} from "core-lib/components/radix/tabs";
import { useApiCallback, useApi, useResolution } from "core-lib/core/hooks";
import {
  CreateUnitConversionParams,
  UnitDto,
} from "core-lib/api/commons/types";
import { UnitConversionForm } from "./UnitConversionForm";
import { UnitConversionForm as UnitConversionFormType } from "./validation";
import { UnitConversionListBlock } from "../list/UnitConversionListBlock";

export const UnitConversionFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [units, setUnits] = useState<UnitDto[]>([]);
  const { showToast } = useToastContext();
  const { isMobile } = useResolution();

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

  const tabs = useMemo<TabOption[]>(
    () => [
      {
        key: "unit_conversion_creation",
        label: "Create Conversion",
        content: (
          <UnitConversionForm
            submitLoading={loading || unitData.loading}
            resetForm={resetForm}
            onSubmit={handleSubmit}
            isInDialog={false}
            units={units}
          />
        ),
      },
      {
        key: "unit_conversion_list",
        label: "Conversions",
        content: <UnitConversionListBlock />,
      },
    ],
    [units, loading, unitData.loading, resetForm],
  );

  return (
    <TabsContextProvider>
      {isMobile ? (
        <TabsHeaderMobile id="unit_conversion_mobile" tabs={tabs} />
      ) : (
        <TabsHeaderDesktop id="unit_conversion_desktop" tabs={tabs} />
      )}
      {tabs.map((tab, index) => (
        <TabPanel
          index={index}
          id={`${tab.key}_tabpanel_${index}`}
          aria-labelledby={`${tab.key}_tab_${index}`}
          key={`${tab.key}_${index}`}
        >
          <Box pt="4">{tab.content}</Box>
        </TabPanel>
      ))}
    </TabsContextProvider>
  );
};
