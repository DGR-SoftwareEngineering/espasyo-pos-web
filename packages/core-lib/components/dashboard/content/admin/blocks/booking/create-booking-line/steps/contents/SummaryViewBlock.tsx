import { Box, Divider, Typography } from "@mui/material";
import { SelectOption } from "../../../../../../../../form/SelectField";
import { Props } from "./types";
import React, { useState, useEffect } from "react";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import { fieldsOf, useApi, useFieldsValidation } from "../../../../../../../../../core/hooks";
import { CreateBookingType } from "../../validation";
import { BackButton, ProceedButton } from "../../../../../../../../buttons";
import { Card } from "../../../../../../../../Card";
import { divStyle } from "./styles";

export const SummaryViewBlock: React.FC<Props> = ({ previous, next, nextStep, previousStep }) => {
    const { form, isDirty } = useCreateBookingFormContext();
    const helperFields = fieldsOf<CreateBookingType>()("location");
    const { isValid, validateNow, setIsValid } = useFieldsValidation<CreateBookingType>(
        form,
        helperFields,
        {
            enabled: true,
            debounceMs: 200,
            validateOnMount: false,
            shouldFocus: false,
        }
    );

    const [selectedLocation, setSelectedLocation] = React.useState<{
        start: string;
        stop: string;
    } | null>(null);

    const handleNext = () => {
        next();
        nextStep("SummaryView");
    };
    const handlePrevious = () => {
        previous();
        previousStep("VehicleAndChassisSelection");
    };
    useEffect(() => {
        setIsValid(true);
    }, [setIsValid])
    return (<>
        <Box
            sx={{
                width: "100%",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <div className="w-full p-2 lg:w-[800px] lg:p-0 mt-[40px]">
                <BackButton
                    onClick={handlePrevious}
                    disabled={!isDirty}
                    loading={false}
                />
                <Box sx={{ width: "100%" }}>
                    <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
                        Driver Selection
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
                            >Kindly select Location</Typography>
                            <Divider sx={divStyle} />
                            { }
                        </Box>
                    </Card>
                    <ProceedButton onClick={handleNext} disabled={!isValid} />
                </Box>
            </div>

        </Box>
    </>);
}