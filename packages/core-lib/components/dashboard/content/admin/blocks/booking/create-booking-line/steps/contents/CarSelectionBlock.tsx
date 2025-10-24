import React, { useEffect, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import {
    SelectField, SelectOption,
} from "../../../../../../../../form/SelectField";
import { Card } from "../../../../../../../../Card";
import { dataStyle, divStyle, infoStyle } from "./styles";

import { ProceedButton, BackButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import {
    fieldsOf, useApi, useFieldsValidation,
} from "../../../../../../../../../core/hooks";

import { CreateBookingType } from "../../validation";
import { useWatch } from "react-hook-form";
import { ICarSelected, Props } from "./types";


export default function CarSelectionBlock({ previous, next, nextStep, previousStep }: Props) {
    const [carSelected, setCarSelected] = useState<ICarSelected>(null);
    const { form, isDirty } = useCreateBookingFormContext();

    const vehicleFields = fieldsOf<CreateBookingType>()("vehicleId");
    const { isValid } = useFieldsValidation<CreateBookingType>(
        form,
        vehicleFields,
        {
            enabled: true,
            debounceMs: 200,
            validateOnMount: false,
            shouldFocus: false,
        }
    );

    const carsData = useApi((api) => api.commons.getAllCar());

    const carsOption: SelectOption[] = carsData.result?.data.response.map(v => ({
        value: v.vehicleId,
        selected: false,
        label: `${v.plateNumber} | ${v.model} | ${v.chassis.type} | ${v.chassis.serialNumber}`,
        car: {
            model: v.model,
            plateNumber: v.plateNumber,
            type: v.chassis.type,
            serialNumber: v.chassis.serialNumber,
            vehicleId: v.vehicleId
        },
    })) ?? [];

    const handleNext = () => {
        next();
        nextStep("AddingLocation");
    };

    const handlePrevious = () => {
        previous();
        previousStep("HelperSelection");
    };
    useEffect(() => {

    }, [])

    return <>
        <Box
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 2,
            }}
        >
            <div className="w-full lg:w-[800px]">
                <BackButton
                    onClick={handlePrevious}
                    disabled={!isDirty}
                    loading={false}
                />
                <Box sx={{ width: "100%" }}>
                    <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
                        Vehicle Selection
                    </h1>
                    <Card sx={{ padding: 5, width: "100%" }} elevation={4}>
                        <Box sx={{ width: "100%" }}>
                            <Typography
                                sx={{
                                    fontFamily: "PT Sans",
                                    fontWeight: "bold",
                                    color: "#0F2A71",
                                    marginBottom: 4,
                                    fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                                }}
                            >
                                Kindly select helper
                            </Typography>
                            <Divider sx={divStyle} />
                            <SelectField
                                name="helperId"
                                control={form.control}
                                options={carsOption}
                                label="Select Helpers"
                                onSelectOption={(option) => {
                                    if (option.value && option.car) {
                                        setCarSelected(option.car);
                                    }
                                }}
                            />
                            {carSelected && (
                                <>
                                    <Divider sx={divStyle} />
                                    <Box className="w-full flex items-center mt-4">
                                        <Box className="flex-1 flex justify-start">
                                            <Typography sx={infoStyle}>Model:</Typography>
                                        </Box>
                                        <Box className="flex-1 flex justify-start">
                                            <Typography sx={infoStyle}>Plate Number:</Typography>
                                        </Box>
                                    </Box>
                                    <Box className="w-full flex items-start">
                                        <Box className="flex-1 flex justify-start">
                                            <Typography sx={dataStyle}>
                                                {carSelected.model}
                                            </Typography>
                                        </Box>
                                        <Box className="flex-1 flex justify-center">
                                            <Typography sx={dataStyle}>
                                                {carSelected?.plateNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            )

                            }

                        </Box>
                    </Card>
                    <ProceedButton onClick={handleNext} disabled={!isValid} />
                </Box>
            </div>
        </Box>
    </>
}