import React, { useMemo } from "react";
import { Card } from "../../../../../../../../Card";
import { Box, Divider, Typography } from "@mui/material";
import {
  SelectField,
  SelectOption,
} from "../../../../../../../../form/SelectField";
import { ProceedButton, BackButton } from "../../../../../../../../buttons";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import {
  fieldsOf,
  useApi,
  useFieldsValidation,
} from "../../../../../../../../../core/hooks";
import { divStyle } from "./styles";
import { CreateBookingType } from "../../validation";
import { useWatch } from "react-hook-form";
import { Props } from "./types";
import { CarSelectionOptions } from "../../../../../../../../form/selection-types";
import { SelectionDetail } from "./SelectionDetail";
import { SelectionBlock } from "./SelectionBlock";

type Car = CarSelectionOptions | null;

export const CarSelectionBlock: React.FC<Props> = ({
  previousStep,
  previous,
  nextStep,
  next,
}) => {
  const { form } = useCreateBookingFormContext();
  const carOptions = useApi((api) => api.commons.getAllCars(["Chassis"]));
  const vehicleField = fieldsOf<CreateBookingType>()("vehicleId");
  const { isValid } = useFieldsValidation<CreateBookingType>(
    form,
    vehicleField,
    {
      enabled: true,
      debounceMs: 200,
      validateOnMount: true,
      shouldFocus: true,
    }
  );

  const selectedCarId = useWatch({
    control: form.control,
    name: "vehicleId",
    defaultValue: "",
  });

  const carSelectOptions: SelectOption[] =
    carOptions.result?.data.response?.map((e) => ({
      value: e.vehicleID,
      label: `${e.plateNumber} | ${e.model}`,
      vehicle: {
        model: e.model,
        plateNumber: e.plateNumber,
        serialNumber: e.chassis.serialNumber,
        type: e.chassis.type,
      },
    })) ?? [];

  const selectedCarInfo: Car = useMemo(
    () =>
      carSelectOptions.find((opt) => opt.value === selectedCarId)?.vehicle ??
      null,
    [selectedCarId, carSelectOptions]
  );

  const handleNext = () => {
    next();
    nextStep("AddingLocation");
  };

  const handlePrevious = () => {
    previous();
    previousStep("HelperSelection");
  };

  return (
    <SelectionBlock>
      <BackButton onClick={handlePrevious} loading={false} />
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
              Kindly select a Vehicle
            </Typography>
            <Divider sx={divStyle} />
            <SelectField
              name="vehicleId"
              control={form.control}
              options={carSelectOptions}
              label="Select Vehicle"
            />
            {selectedCarInfo && <SelectionDetail data={selectedCarInfo} />}
          </Box>
        </Card>
        <ProceedButton onClick={handleNext} disabled={!isValid} />
      </Box>
    </SelectionBlock>
  );
};
