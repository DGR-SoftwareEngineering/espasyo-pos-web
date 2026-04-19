import React, {useEffect, useMemo, useState} from "react";
import { useToastContext } from "../../../../core/contexts";
import {useApi, useApiCallback} from "core-lib/core/hooks";
import {
    CategoryDataList,
    CreateUnitConversionParams,
    UnitConversionResponse,
    UpdateUnitConversionParams
} from "core-lib/api/commons/types";
import { UnitConversionForm } from "../../../../../../apps/espasyo-pos/src/components/contents/unit-conversion/forms/UnitConversionForm";
import { UnitConversionForm as UnitConversionFormType } from "../../../../../../apps/espasyo-pos/src/components/contents/unit-conversion/forms/validation";



export const UnitConversionEditDialog: React.FC<
{conversion: UnitConversionResponse;
onSuccess?: () => void;
onClose?: () => void;}
> = ({
    conversion,
    onSuccess,
    onClose,
}) => {
    const [categories, setCategories] = useState<CategoryDataList[]>([]);
    const [loading, setLoading] = useState(false);
    const {showToast} = useToastContext();

    const categoryData = useApi((api) => api.commons.categoryList());

    useEffect(() => {
        setCategories(categoryData.result?.data?.response ?? []);
         }, [categoryData.result?.data?.response]);
    const updateUnitConversionCb = useApiCallback(
        async (api, args: UpdateUnitConversionParams & {unitConversionID: string}) => 
            await api.commons.updateUnitConversion(args),
    );
         const handleSubmit = async (formValues: UnitConversionFormType) => {
            try{
                const apiValues: UpdateUnitConversionParams ={
                unitConversionID: conversion.unitConversionID,
                fromUnitID: formValues.fromUnitID,
                toUnitID: formValues.toUnitID,
                isApproximate: formValues.isApproximate,
                conversionRate: formValues.conversionRate,
                 notes: formValues.notes?.trim() ? formValues.notes : null,
                };
                const result =  await updateUnitConversionCb.execute(apiValues);
            
                if (result.status === 200 && result.data.success) {
                    showToast("Unit Conversion update successfully", "success");
                    onSuccess?.()
                    onClose?.()
                } else {
                    showToast(
                        result.data.message || "Failed to update unit conversion",
                        "error",
                     );
                }
            } catch (error){
                console.error("Error updating unit conversion:", error);
                showToast("Failed to update unit conversion", "error");
            } finally {
                setLoading(false);
            }
         };

         const initialValues: Partial<UnitConversionFormType> = {
            fromUnitID: conversion.fromUnitID,
            toUnitID: conversion.toUnitID,
            conversionRate: conversion.conversionRate,
            isApproximate: conversion.isApproximate,
            notes: conversion.notes ?? "",
         };

         return(
            <UnitConversionForm
            submitLoading={loading || categoryData.loading}
            resetForm={false}
            onSubmit={handleSubmit}
            isInDialog={true}
            initialValues={initialValues}
            />
         );
    
};