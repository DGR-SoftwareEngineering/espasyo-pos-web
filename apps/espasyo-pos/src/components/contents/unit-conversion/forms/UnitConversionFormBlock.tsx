import { useToastContext } from "core-lib";
import React, { useEffect, useMemo, useState } from "react";
import { UnitConversionForm } from "./UnitConversionForm";
import { UnitConversionForm as UnitConversionFormType } from "./validation";
import { useApiCallback, useApi, useResolution } from "core-lib/core/hooks";
import {
  CategoryDataList,
  CreateUnitConversionParams,
} from "core-lib/api/commons/types";
import { TabOption } from "core-lib/components/tabs/types";
import {
  TabsContextProvider,
  TabsHeaderMobile,
  TabsHeaderDesktop,
  TabPanel,
} from "core-lib";
import { UnitConversionListBlock } from "../list/UnitConversionListBlock";

export const UnitConversionFormBlock: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const [categories, setCategories] = useState<CategoryDataList[]>([]);
  const { showToast } = useToastContext();
  const { isMobile } = useResolution();

  const data = useApi((api) => api.commons.categoryList());
  const conversionCb = useApiCallback(
    async (api, args: CreateUnitConversionParams) =>
      await api.commons.createUnitConversion(args),
  );

  useEffect(() => {
    setCategories(data.result?.data?.response ?? []);
  }, [data.result?.data?.response]);

  
    const tabs = useMemo<Array<TabOption>>(
    () => [
      {
        key: "unit_conversion_creation",
        label: "Unit Conversion Creation Form",
        content: (
          //we can transfer this to higher level if we want to make it more cleaner.
          <UnitConversionForm
            submitLoading={loading || data.loading}
            resetForm={resetForm}
            onSubmit={handleSubmit}
            isInDialog={false}
            categories={categories}
          />
        ),
      },
      {
        key: "unit_conversion_list",
        label: "Unit Conversion List",
        content: <UnitConversionListBlock />,
      },
    ],
[],
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
          {tab.content}
        </TabPanel>
      ))}
    </TabsContextProvider>
  );

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
      showToast("Failed to create unit conversion", "error");
    } finally {
      setLoading(false);
    }
  }
};
